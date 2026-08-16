/**
 * @deprecated Import from the specific service instead:
 *   contentMetadataService → './contentMetadata.service'
 *   recipeService          → './recipe.service'
 *   cultureService         → './culture.service'
 *   classService           → './class.service'
 *   gameService            → './game.service'
 *   mediaService           → './media.service'
 *
 * This barrel re-exports everything for backward compatibility.
 */

export { contentMetadataService } from './contentMetadata.service';
export { recipeService } from './recipe.service';
export { cultureService } from './culture.service';
export { classService } from './class.service';
export { gameService } from './game.service';

// contentService shim — combines all services under the old single-object name
import { contentMetadataService } from './contentMetadata.service';
import { recipeService } from './recipe.service';
import { cultureService } from './culture.service';
import { classService } from './class.service';
import { gameService } from './game.service';
import { mediaService } from './media.service';

export const contentService = {
    ...contentMetadataService,
    ...recipeService,
    ...cultureService,
    ...classService,
    ...gameService,
    // media helpers that were previously in contentService
    getMediaAssetsByIds: mediaService.getMediaAssetsByIds.bind(mediaService),
    getGallery: mediaService.getGallery.bind(mediaService),
};
