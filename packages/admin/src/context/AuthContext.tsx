import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authService, UserProfile } from '../services/auth.service';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@thaiakha/shared/lib/supabase';

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signIn: typeof authService.signIn;
    signUp: typeof authService.signUp;
    signUpAgency: (
        email: string,
        password: string,
        contactName: string,
        companyName: string,
        taxId: string,
        phone: string
    ) => Promise<any>;
    signOut: typeof authService.signOut;
    updateProfile: typeof authService.updateProfile;
    changePassword: typeof authService.changePassword;
    uploadAvatar: typeof authService.uploadAvatar;
    refreshProfile: () => Promise<void>;
}

const PROFILE_CACHE_KEY = 'akha_user_profile_cache_v1';

function getCachedProfile(): UserProfile | null {
    try {
        const cached = localStorage.getItem(PROFILE_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch {
        localStorage.removeItem(PROFILE_CACHE_KEY);
        return null;
    }
}

// Helper: retry a function on AbortError (caused by React StrictMode double-mount)
async function withAbortRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 100): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (e: any) {
            const isAbort = e?.name === 'AbortError' || e?.message?.includes('signal is aborted');
            if (isAbort && attempt < retries) {
                console.log(`[Auth] AbortError, retrying in ${delayMs}ms (attempt ${attempt + 1})`);
                await new Promise(r => setTimeout(r, delayMs));
                continue;
            }
            throw e;
        }
    }
    throw new Error('withAbortRetry: exhausted retries');
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const cachedProfile = getCachedProfile();
    const [user, setUser] = useState<UserProfile | null>(cachedProfile);
    const [session, setSession] = useState<Session | null>(null);
    // If we have cached profile, skip loading — show app instantly
    const [loading, setLoading] = useState(!cachedProfile);
    const refreshingRef = useRef(false);
    // Guard: track which session we already processed to avoid duplicate SIGNED_IN
    const processedSessionRef = useRef<string | null>(null);
    // Guard: when signIn() is handling profile fetch, skip onAuthStateChange fetch
    const signInHandlingRef = useRef(false);

    const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
        try {
            console.log("[Auth] Fetching profile for:", userId);
            const { data, error } = await withAbortRetry(async () => {
                const result = await supabase
                    .from('profiles')
                    .select(`
                        id, full_name, email, role, avatar_url, whatsapp,
                        dietary_profile, allergies, preferred_spiciness_id,
                        agency_company_name, agency_commission_rate,
                        agency_tax_id, agency_phone, commission_config,
                        agency_address, agency_city, agency_province, agency_country, agency_postal_code,
                        gender, age, nationality, is_active
                    `)
                    .eq('id', userId)
                    .maybeSingle();
                return result;
            });

            if (error) {
                console.error("[Auth] Profiles table error:", error.message, error.code);
                return null;
            }
            if (!data) {
                console.warn("[Auth] No profile found for UID:", userId);
                return null;
            }

            console.log("[Auth] Profile data received for role:", data.role);

            const profile: UserProfile = {
                id: data.id,
                full_name: data.full_name || 'User',
                email: data.email,
                role: (data.role as UserProfile['role']) || 'agency',
                avatar_url: data.avatar_url,
                whatsapp: data.whatsapp,
                dietary_profile: data.dietary_profile || 'diet_regular',
                allergies: data.allergies || [],
                preferred_spiciness_id: data.preferred_spiciness_id || 2,
                agency_company_name: data.agency_company_name,
                agency_commission_rate: data.agency_commission_rate,
                agency_tax_id: data.agency_tax_id,
                agency_phone: data.agency_phone,
                commission_config: data.commission_config,
                agency_address: data.agency_address,
                agency_city: data.agency_city,
                agency_province: data.agency_province,
                agency_country: data.agency_country,
                agency_postal_code: data.agency_postal_code,
                gender: data.gender,
                age: data.age,
                nationality: data.nationality,
                is_active: data.is_active
            };

            localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
            return profile;
        } catch (e: any) {
            console.error("[Auth] fetchProfile exception:", e.message || e);
            return null;
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        try {
            const { data: { session: s } } = await withAbortRetry(() => supabase.auth.getSession());
            if (s?.user) {
                const profile = await fetchProfile(s.user.id);
                if (profile) setUser(profile);
            } else {
                setUser(null);
                localStorage.removeItem(PROFILE_CACHE_KEY);
            }
        } catch (error) {
            console.error("[Auth] refreshProfile error:", error);
        } finally {
            refreshingRef.current = false;
        }
    }, [fetchProfile]);

    useEffect(() => {
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;
            console.log("[Auth] onAuthStateChange:", event);

            if (event === 'SIGNED_OUT') {
                processedSessionRef.current = null;
                setSession(null);
                setUser(null);
                setLoading(false);
                localStorage.removeItem(PROFILE_CACHE_KEY);
                return;
            }

            // Update session for any event that carries one
            if (newSession) {
                setSession(newSession);
            }

            // TOKEN_REFRESHED: session updated above, no need to re-fetch profile
            if (event === 'TOKEN_REFRESHED') {
                return;
            }

            if (event === 'SIGNED_IN' && newSession?.user) {
                const sessionId = newSession.access_token;

                // Skip if we already processed this exact session (prevents infinite loop)
                if (processedSessionRef.current === sessionId) {
                    console.log("[Auth] Skipping duplicate SIGNED_IN for same session");
                    return;
                }
                processedSessionRef.current = sessionId;

                // Skip if signIn() is already handling the profile fetch
                if (signInHandlingRef.current) {
                    console.log("[Auth] signIn() is handling profile, skipping onAuthStateChange fetch");
                    return;
                }

                // Fetch profile only if we don't have one or it's a different user
                if (!user || user.id !== newSession.user.id) {
                    setLoading(true);
                    const profile = await fetchProfile(newSession.user.id);
                    if (mounted) {
                        if (profile) {
                            console.log("[Auth] Profile set via onAuthStateChange:", profile.role);
                            setUser(profile);
                        } else {
                            console.error("[Auth] SIGNED_IN but failed to fetch profile");
                        }
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            }
        });

        // Check initial session
        const initAuth = async () => {
            try {
                const { data: { session: currentSession } } = await withAbortRetry(
                    () => supabase.auth.getSession()
                );
                if (!mounted) return;

                setSession(currentSession);

                if (currentSession?.user) {
                    // Mark this session as processed so onAuthStateChange SIGNED_IN doesn't double-fetch
                    processedSessionRef.current = currentSession.access_token;

                    const cached = getCachedProfile();
                    if (cached && cached.id === currentSession.user.id) {
                        // Cache valid — app already visible, refresh in background
                        setUser(cached);
                        setLoading(false);
                        fetchProfile(currentSession.user.id).then(fresh => {
                            if (mounted && fresh) setUser(fresh);
                        });
                    } else {
                        // No valid cache — must fetch
                        const profile = await fetchProfile(currentSession.user.id);
                        if (mounted) {
                            setUser(profile);
                            setLoading(false);
                        }
                    }
                } else {
                    // No session
                    if (mounted) {
                        setUser(null);
                        localStorage.removeItem(PROFILE_CACHE_KEY);
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("[Auth] initAuth error:", error);
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        };

        initAuth();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
        await authService.updateProfile(userId, updates);
        await refreshProfile();
    }, [refreshProfile]);

    const signIn = useCallback(async (email: string, password: string) => {
        // Signal that we're handling the profile fetch, so onAuthStateChange skips it
        signInHandlingRef.current = true;
        setLoading(true);
        try {
            const response = await authService.signIn(email, password);
            if (response.user) {
                // Mark this session as processed
                if (response.session) {
                    processedSessionRef.current = response.session.access_token;
                }
                const profile = await fetchProfile(response.user.id);
                if (profile) {
                    console.log("[Auth] signIn profile fetched:", profile.role);
                    setUser(profile);
                } else {
                    console.error("[Auth] signIn failed to fetch profile");
                }
            }
            setLoading(false);
            return response;
        } catch (error) {
            setLoading(false);
            throw error;
        } finally {
            signInHandlingRef.current = false;
        }
    }, [fetchProfile]);

    const signUp = useCallback(async (email: string, password: string, fullName: string) => {
        const response = await authService.signUp(email, password, fullName);
        return response;
    }, []);

    const signUpAgency = useCallback(async (
        email: string,
        password: string,
        contactName: string,
        companyName: string,
        taxId: string,
        phone: string
    ) => {
        const response = await authService.signUpAgency(email, password, contactName, companyName, taxId, phone);
        return response;
    }, []);

    const uploadAvatar = useCallback(async (userId: string, file: File) => {
        const response = await authService.uploadAvatar(userId, file);
        await refreshProfile();
        return response;
    }, [refreshProfile]);

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signUpAgency,
        signOut: authService.signOut,
        updateProfile,
        changePassword: authService.changePassword,
        uploadAvatar,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
