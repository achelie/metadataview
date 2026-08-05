export const recommendations = Object.freeze({
  location: 'Remove location metadata before sharing the image publicly.',
  device: 'Strip device identifiers if you do not want separate images linked to the same camera or phone.',
  time: 'Remove embedded capture dates when timing could reveal routines, travel, or attendance.',
  identity: 'Remove author and contact fields before publishing anonymously or under a pseudonym.',
  rights: 'Keep this information if attribution matters; otherwise remove it before anonymous sharing.',
  software: 'Remove software labels if you do not want to disclose your editing setup.',
  history: 'Remove editing history and persistent document identifiers before public distribution.',
  workflow: 'Remove generation data if prompts, local paths, models, or workflow structure are private.',
  thumbnail: 'Re-encode the image so an embedded preview is not carried into the shared copy.',
  network: 'Remove internal addresses, local URLs, and token-bearing links. Rotate exposed credentials when appropriate.',
});
