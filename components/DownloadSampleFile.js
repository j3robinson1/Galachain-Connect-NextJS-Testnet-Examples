import React from 'react';

const sampleMetadata = [
  {
    "featured": "https://i2.seadn.io/ethereum/0xad9fd7cb4fc7a0fbce08d64068f60cbde22ed34c/22273f0e8465cc335ab630fb4ade3746.png",
    "attributes": [
      { "trait_type": "Class", "value": "Boat Captain" },
      { "trait_type": "Gender", "value": "Male" },
      { "trait_type": "Outfit", "value": "Life Jacket Whistle" },
      { "trait_type": "Hair Style", "value": "Side-Swept" },
      { "trait_type": "Facial Hair", "value": "Brush Mustache" },
      { "trait_type": "Hat", "value": "Flat Cap" },
      { "trait_type": "Hair Color", "value": "Cod Gray" },
      { "trait_type": "Pupil Color", "value": "Cement" },
      { "trait_type": "Boot Color", "value": "Light Brown" },
      { "trait_type": "Shirt Color", "value": "Cream Can" },
      { "trait_type": "Lifejacket Color", "value": "Red" },
      { "trait_type": "Pant Color", "value": "Paradiso" },
      { "trait_type": "Hat Color", "value": "Electric Violet" }
    ]
  },
  {
    "featured": "https://i2.seadn.io/ethereum/0xad9fd7cb4fc7a0fbce08d64068f60cbde22ed34c/d9cd991a5437d5b857e5451586b82bfc.png",
    "attributes": [
      { "trait_type": "Class", "value": "Weaver" },
      { "trait_type": "Gender", "value": "Female" },
      { "trait_type": "Outfit", "value": "Weaver Outfit" },
      { "trait_type": "Hair Style", "value": "Long Fringe" },
      { "trait_type": "Hair Color", "value": "Millbrook" },
      { "trait_type": "Pupil Color", "value": "Blue" },
      { "trait_type": "Shoe Color", "value": "Medium Brown" },
      { "trait_type": "Shirt Color", "value": "Mandy's Pink" },
      { "trait_type": "Pant Color", "value": "White" }
    ]
  }
];

const downloadSampleFile = () => {
  const fileData = JSON.stringify(sampleMetadata, null, 2);
  const blob = new Blob([fileData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample-metadata.json';
  
  // Append link to body, trigger click and then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the object URL after download
  URL.revokeObjectURL(url);
};

const DownloadSampleFile = () => {
  return (
    <div>
      <button onClick={downloadSampleFile}>
        Download Sample Metadata File
      </button>
    </div>
  );
};

export default DownloadSampleFile;
