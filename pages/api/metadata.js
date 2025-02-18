// pages/api/metadata/index.js

export default function handler(req, res) {
  const tokenData = req.body;
  const { id, collection, category, type } = tokenData || {};

  if (
    collection === 'FuzzlePrime' &&
    category === 'PFP' &&
    type === 'Fuzzle'
  ) {
    if (id === 1) {
      return res.status(200).json({
        featured:
          'https://raw2.seadn.io/ethereum/0x04942f6e50086a371c66d51710b0cc5eea91cf37/4a2bb6c159efac9dc6b40efef6478f7f.mp4',
        attributes: [
          { trait_type: 'Personality', value: 'Baskita' },
          { trait_type: 'Class', value: 'Monk' },
          { trait_type: 'Creator', value: 'Erin' },
          { trait_type: 'Fur', value: 'Graviton' },
          { trait_type: 'Coloration', value: 'Gamma Ray' },
          { trait_type: 'Accent', value: 'One Patch Coral' },
          { trait_type: 'Eyes', value: 'Fuzzle Uncommon Pink' },
          { trait_type: 'Eyes Part', value: 'Fuzzle Uncommon Pink' },
          { trait_type: 'Eyes Rarity', value: 'Uncommon' },
          { trait_type: 'Eyes Look', value: 'Uncommon Pink' },
        ],
      });
    } else if (id === 2) {
      return res.status(200).json({
        featured:
          'https://raw2.seadn.io/ethereum/0x04942f6e50086a371c66d51710b0cc5eea91cf37/8fc6d410f955086237ce67d635110dd5.mp4',
        attributes: [
          { trait_type: 'Personality', value: 'Baskita' },
          { trait_type: 'Class', value: 'Galactic Trader' },
          { trait_type: 'Creator', value: 'Matt' },
          { trait_type: 'Fur', value: 'Interstellar' },
          { trait_type: 'Coloration', value: 'Terra' },
          { trait_type: 'Accent', value: 'Two Patches Astral Blonde' },
          { trait_type: 'Ears', value: 'Aries Uncommon Cloudburst' },
          { trait_type: 'Ears Part', value: 'Aries' },
          { trait_type: 'Ears Rarity', value: 'Uncommon' },
          { trait_type: 'Ears Look', value: 'Uncommon Cloudburst' },
          { trait_type: 'Tail', value: 'Nubula Common Celestial Ivory' },
          { trait_type: 'Tail Part', value: 'Nubula' },
          { trait_type: 'Tail Rarity', value: 'Common Celestial Ivory' },
          { trait_type: 'Tail Look', value: 'Common Celestial Ivory' },
          { trait_type: 'Eyes', value: 'Fuzzle Uncommon Pink' },
          { trait_type: 'Eyes Part', value: 'Fuzzle Uncommon Pink' },
          { trait_type: 'Eyes Rarity', value: 'Uncommon' },
          { trait_type: 'Eyes Look', value: 'Uncommon Pink' },
        ],
      });
    } else {
      return res.status(404).json({
        error: 'No matching token metadata found for this ID.',
      });
    }
  } else {
    return res.status(404).json({
      error: 'No metadata for this collection/category/type.',
    });
  }
}
