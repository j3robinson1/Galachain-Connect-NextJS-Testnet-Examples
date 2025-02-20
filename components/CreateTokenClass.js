import React, { useState } from 'react';
import DownloadSampleFile from './DownloadSampleFile';

const CreateTokenClass = ({ walletAddress, metamaskClient }) => {
  // Helper to get default form values based on token type
  const getDefaultFormValues = (isNonFungible, nftType) => {
    if (!isNonFungible) {
      return {
        uniqueKey: `token-create-${new Date().toISOString()}`,
        network: "GC",
        isNonFungible: false,
        decimals: 18,
        maxCapacity: "50000000000",
        maxSupply: "50000000000",
        tokenClass: {
          collection: "Token",
          category: "Unit",
          type: "GALA",
          additionalKey: walletAddress,
        },
        name: "Gala Test",
        symbol: "GALA",
        description: "Gala Token Description",
        image:
          "https://assets.coingecko.com/coins/images/12493/standard/GALA_token_image_-_200PNG.png",
      };
    } else if (nftType === "ERC1155") {
      return {
        uniqueKey: `nft-create-${new Date().toISOString()}`,
        network: "GC",
        isNonFungible: true,
        decimals: 0,
        maxCapacity: "9007199254740991",
        maxSupply: "9007199254740991",
        tokenClass: {
          collection: "LegendsReborn",
          category: "Creature",
          type: "FuriousBugbear",
          additionalKey: "Common",
        },
        name: "LegendsRebornCreatureFuriousBugbearCommon",
        symbol: "LegendsRebornCreatur",
        description:
          "It does not take much to make a Bugbear angry. But to make them furious? Also quite easy as chance would have it.",
        image:
          "https://tokens.gala.games/images/kung-fu-factory/legends-reborn/ritual-stone-series-1/furious-bugbear-common.gif",
      };
    } else if (nftType === "ERC721") {
      return {
        uniqueKey: `nft-create-${new Date().toISOString()}`,
        network: "GC",
        isNonFungible: true,
        decimals: 0,
        maxCapacity: "9007199254740991",
        maxSupply: "9007199254740991",
        tokenClass: {
          collection: "FuzzlePrime",
          category: "PFP",
          type: "Fuzzle",
          additionalKey: "/api/metadata",
        },
        name: "FuzzlePrimePFPFuzzle",
        symbol: "FuzzlePrimeFuzzle",
        description:
          "Fuzzles are adorable alien overlord collectables powered by the most advanced artificial intelligence. Own, trade, play and earn with your unique NFT character.",
        image:
          "https://i2.seadn.io/ethereum/384ec2af192943878ec7ef266b3c7b4e/6765f988358bdab65b3dab89ddd2cf/296765f988358bdab65b3dab89ddd2cf.png",
      };
    }
  };

  // Initial state: by default, we start with a fungible token.
  const [formValues, setFormValues] = useState(getDefaultFormValues(false, null));
  // Store the NFT type (only used when isNonFungible is true)
  const [nftType, setNftType] = useState("ERC1155");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // State for master JSON upload (for ERC721 only)
  const [masterJson, setMasterJson] = useState(null);

  // For updating text inputs inside formValues (including tokenClass fields)
  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    if (keys.length > 1) {
      setFormValues((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update form values when toggling between fungible and non-fungible
  const handleNonFungibleSelectChange = (e) => {
    const value = e.target.value === "true"; // convert string to boolean
    const newDefaults = getDefaultFormValues(value, value ? nftType : null);
    setFormValues(newDefaults);
  };

  // Update form values when switching NFT types
  const handleNftTypeChange = (e) => {
    const newNftType = e.target.value;
    setNftType(newNftType);
    const newDefaults = getDefaultFormValues(true, newNftType);
    setFormValues(newDefaults);
  };

  // Handle file input for master JSON upload
  const handleMasterFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setMasterJson(parsed);
          } else {
            alert("JSON file must contain an array of metadata objects");
          }
        } catch (err) {
          console.error("Error parsing JSON file", err);
          alert("Error parsing JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to upload each metadata object separately
  const uploadMetadataFiles = async () => {
    if (!masterJson || masterJson.length === 0) return;
    // We intentionally do NOT set isProcessing here to true again,
    // because we might want to show the user that the token creation was successful
    // and that we are now uploading. Feel free to adjust as needed.
    try {
      // Determine collection folder name from form values
      const collection = formValues.tokenClass.collection;
      // Loop over each metadata object and upload it separately
      for (let i = 0; i < masterJson.length; i++) {
        const metadataObj = masterJson[i];
        const id = i + 1;
        // Here you would send a request to your backend API that writes the file to:
        // /metadata/[collection]/[id].json
        const response = await fetch(`/api/uploadMetadata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection, id, metadata: metadataObj }),
        });
        if (!response.ok) {
          throw new Error(`Failed to upload metadata file for ID ${id}`);
        }
      }
      alert("Master JSON metadata uploaded successfully.");
    } catch (err) {
      console.error("Metadata upload error:", err);
      alert(`Token class created, but metadata upload failed: ${err.message}`);
    }
  };

  const isValidForm = () => {
    return (
      formValues.name &&
      formValues.symbol &&
      formValues.tokenClass?.collection
    );
  };

  // Function to create a token class by calling the CreateTokenClass endpoint
  const createTokenClass = async () => {
    if (!isValidForm() || !walletAddress) return;

    setError("");
    setSuccess("");
    setIsProcessing(true);

    try {
      console.log("Form values:", formValues);
      const signedDto = await metamaskClient.sign("CreateTokenClass", formValues);
      console.log("Signed DTO:", signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/CreateTokenClass`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create token class");
      }

      const responseData = await response.json();
      console.log("Token class created successfully:", responseData);
      setSuccess(`Token class "${formValues.name}" created successfully!`);

      // Only upload metadata if ERC721, we have a master JSON, and creation was successful
      if (
        formValues.isNonFungible &&
        nftType === "ERC721" &&
        masterJson &&
        masterJson.length > 0
      ) {
        await uploadMetadataFiles();
      }
    } catch (err) {
      console.error(`Error creating token class: ${err}`, err);
      setError(err instanceof Error ? err.message : "Failed to create token class");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to update a token class by calling the UpdateTokenClass endpoint
  const updateTokenClass = async () => {
    if (!isValidForm() || !walletAddress) return;

    setError("");
    setSuccess("");
    setIsProcessing(true);

    try {
      console.log("Form values:", formValues);
      const signedDto = await metamaskClient.sign("UpdateTokenClass", formValues);
      console.log("Signed DTO:", signedDto);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TESTNET_TOKEN_CONTRACT}/UpdateTokenClass`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signedDto),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update token class");
      }

      const responseData = await response.json();
      console.log("Token class updated successfully:", responseData);
      setSuccess(`Token class "${formValues.name}" updated successfully!`);
    } catch (err) {
      console.error(`Error updating token class: ${err}`, err);
      setError(err instanceof Error ? err.message : "Failed to update token class");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="create-token-class-container">
      <h2>Create / Update Token Class</h2>
      <div className="form">
        {/* Top Row: Type and NFT Type */}
        <div className="top-row">
          <div className="input-group">
            <label>Type</label>
            <select
              name="isNonFungible"
              value={formValues.isNonFungible.toString()}
              onChange={handleNonFungibleSelectChange}
              disabled={isProcessing}
            >
              <option value="false">Token</option>
              <option value="true">NFT</option>
            </select>
          </div>
          {formValues.isNonFungible && (
            <div className="input-group">
              <label>NFT Type</label>
              <select
                name="nftType"
                value={nftType}
                onChange={handleNftTypeChange}
                disabled={isProcessing}
              >
                <option value="ERC1155">ERC1155</option>
                <option value="ERC721">ERC721</option>
              </select>
            </div>
          )}
        </div>

        {/* If ERC721 is selected, show master JSON upload row */}
        {formValues.isNonFungible && nftType === "ERC721" && (
          <>
            <DownloadSampleFile />
            <div
              className="master-json-upload-row"
              style={{
                margin: "1rem 0",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <label>Upload Master JSON File:</label>
              <input
                type="file"
                accept="application/json"
                onChange={handleMasterFileUpload}
                disabled={isProcessing}
              />
            </div>
          </>
        )}

        {/* Rest of the form fields (excluding network) */}
        <div className="form-grid">
          {Object.keys(formValues)
            .filter((key) => key !== "isNonFungible" && key !== "network")
            .map((key) => {
              if (key === "tokenClass") {
                return (
                  <div key={key} className="input-group token-class-row">
                    <div className="token-class-items">
                      {Object.keys(formValues[key]).map((subKey) => (
                        <div key={subKey} className="token-class-item">
                          <label>{subKey}</label>
                          <input
                            type="text"
                            name={`${key}.${subKey}`}
                            value={formValues[key][subKey]}
                            onChange={handleChange}
                            disabled={isProcessing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div key={key} className="input-group">
                  <label>{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={formValues[key]}
                    onChange={handleChange}
                    disabled={isProcessing}
                  />
                </div>
              );
            })}
        </div>

        <div
          className="button-group"
          style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
        >
          <button onClick={createTokenClass} disabled={!isValidForm() || isProcessing}>
            {isProcessing ? "Processing..." : "Create Token Class"}
          </button>
          <button onClick={updateTokenClass} disabled={!isValidForm() || isProcessing}>
            {isProcessing ? "Processing..." : "Update Token Class"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default CreateTokenClass;
