import { uploadFile, uploadJSON, createNFTMetadata } from "./utils/ipfs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Upload Property Images and Metadata to IPFS
 *
 * This script:
 * 1. Creates placeholder images for each property
 * 2. Uploads images to IPFS via Pinata
 * 3. Generates proper NFT metadata with real IPFS CIDs
 * 4. Uploads metadata JSON to IPFS
 * 5. Saves IPFS CIDs for use in NFT minting
 */

dotenv.config();

// Property data from output/nfts.json
const properties = {
  realEstate: [
    {
      id: "RE-001",
      name: "Luxury Villa in Lekki, Lagos",
      description: "Modern 4-bedroom luxury villa in premium Lekki Phase 1 location. Features include swimming pool, smart home technology, and 24/7 security.",
      location: "Lekki Phase 1, Lagos, Nigeria",
      type: "Residential",
      attributes: [
        { trait_type: "Property Type", value: "Residential" },
        { trait_type: "Bedrooms", value: 4 },
        { trait_type: "Bathrooms", value: 3 },
        { trait_type: "Square Feet", value: 3200 },
        { trait_type: "Year Built", value: 2020 },
        { trait_type: "Monthly Rent", value: "2500 USD" },
        { trait_type: "Estimated Value", value: "500000 USD" },
        { trait_type: "Location", value: "Lagos, Nigeria" },
      ],
    },
    {
      id: "RE-002",
      name: "Commercial Office Building, Accra",
      description: "5-story commercial office building in central Accra business district. Fully leased with long-term tenants. Excellent ROI.",
      location: "Airport Residential Area, Accra, Ghana",
      type: "Commercial",
      attributes: [
        { trait_type: "Property Type", value: "Commercial" },
        { trait_type: "Floors", value: 5 },
        { trait_type: "Total Area", value: 12000 },
        { trait_type: "Year Built", value: 2018 },
        { trait_type: "Monthly Income", value: "15000 USD" },
        { trait_type: "Estimated Value", value: "5000000 USD" },
        { trait_type: "Tenants", value: 8 },
        { trait_type: "Location", value: "Accra, Ghana" },
      ],
    },
  ],
  agriculture: [
    {
      id: "AG-001",
      name: "Organic Coffee Farm, Yirgacheffe",
      description: "Premium organic coffee farm in the renowned Yirgacheffe region. Certified organic and fair trade. Consistent high-quality yields.",
      location: "Yirgacheffe, Sidama, Ethiopia",
      type: "Coffee Plantation",
      attributes: [
        { trait_type: "Property Type", value: "Agriculture" },
        { trait_type: "Crop Type", value: "Arabica Coffee" },
        { trait_type: "Acres", value: 50 },
        { trait_type: "Certifications", value: "Organic, Fair Trade" },
        { trait_type: "Annual Yield", value: "25000 kg" },
        { trait_type: "Expected Revenue", value: "150000 USD/year" },
        { trait_type: "Harvest Season", value: "November - January" },
        { trait_type: "Location", value: "Yirgacheffe, Ethiopia" },
      ],
    },
    {
      id: "AG-002",
      name: "Cocoa Plantation, Ashanti Region",
      description: "Established cocoa plantation with premium quality beans. Rainforest Alliance certified. Strong buyer relationships.",
      location: "Ashanti Region, Ghana",
      type: "Cocoa Plantation",
      attributes: [
        { trait_type: "Property Type", value: "Agriculture" },
        { trait_type: "Crop Type", value: "Premium Cocoa" },
        { trait_type: "Acres", value: 100 },
        { trait_type: "Certifications", value: "Rainforest Alliance" },
        { trait_type: "Annual Yield", value: "40000 kg" },
        { trait_type: "Expected Revenue", value: "200000 USD/year" },
        { trait_type: "Harvest Season", value: "October - March" },
        { trait_type: "Location", value: "Ashanti, Ghana" },
      ],
    },
  ],
  properties: [
    {
      id: "PROP-001",
      name: "Logistics Warehouse, Durban Port",
      description: "Modern warehouse facility near Durban port with excellent logistics access. Prime location for import/export operations.",
      location: "Port of Durban, KwaZulu-Natal, South Africa",
      type: "Industrial Warehouse",
      attributes: [
        { trait_type: "Property Type", value: "Industrial" },
        { trait_type: "Total Area", value: 50000 },
        { trait_type: "Year Built", value: 2019 },
        { trait_type: "Monthly Income", value: "12000 USD" },
        { trait_type: "Estimated Value", value: "2000000 USD" },
        { trait_type: "Tenants", value: 3 },
        { trait_type: "Location", value: "Durban, South Africa" },
      ],
    },
    {
      id: "PROP-002",
      name: "Multi-level Parking Garage, Cape Town CBD",
      description: "5-level automated parking facility in central business district. High traffic area with consistent revenue stream.",
      location: "Cape Town CBD, Western Cape, South Africa",
      type: "Parking Facility",
      attributes: [
        { trait_type: "Property Type", value: "Parking" },
        { trait_type: "Levels", value: 5 },
        { trait_type: "Capacity", value: 500 },
        { trait_type: "Year Built", value: 2021 },
        { trait_type: "Monthly Revenue", value: "8000 USD" },
        { trait_type: "Estimated Value", value: "1500000 USD" },
        { trait_type: "Operating Hours", value: "24/7" },
        { trait_type: "Location", value: "Cape Town, South Africa" },
      ],
    },
  ],
};

/**
 * Find property image file
 * Looks for image files in assets/images/{category}/{propertyId}.{ext}
 * Supports: .jpg, .jpeg, .png, .webp
 */
function findPropertyImage(
  propertyId: string,
  category: "real-estate" | "agriculture" | "properties"
): string | null {
  const imagesDir = path.join(process.cwd(), "assets", "images", category);

  // Supported image extensions
  const extensions = [".jpg", ".jpeg", ".png", ".webp"];

  // Try to find image with any supported extension
  for (const ext of extensions) {
    const filepath = path.join(imagesDir, `${propertyId}${ext}`);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
  }

  return null;
}

/**
 * Create a simple placeholder image file if real image doesn't exist
 */
function createPlaceholderImage(propertyId: string, name: string, category: string): string {
  const assetsDir = path.join(process.cwd(), "assets", "images", category);
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const filename = `${propertyId}.txt`;
  const filepath = path.join(assetsDir, filename);

  // Create a simple text file as placeholder
  const content = `Property Image Placeholder

Property ID: ${propertyId}
Property Name: ${name}

This is a placeholder image file.
Add a real image file named ${propertyId}.jpg (or .png, .webp) to:
${assetsDir}/

Then re-run: npm run upload:ipfs

Generated: ${new Date().toISOString()}
`;

  fs.writeFileSync(filepath, content);
  return filepath;
}

async function main() {
  console.log("\n🚀 Uploading Property Assets to IPFS\n");
  console.log("=".repeat(60));

  const results: any = {
    realEstate: [],
    agriculture: [],
    properties: [],
  };

  // Process Real Estate properties
  console.log("\n📍 Real Estate Properties:");
  for (const property of properties.realEstate) {
    console.log(`\n   Processing: ${property.name}`);

    // Look for real image, fallback to placeholder
    let imagePath = findPropertyImage(property.id, "real-estate");
    if (imagePath) {
      console.log(`   ✅ Found image: ${path.basename(imagePath)}`);
    } else {
      console.log(`   ⚠️  No image found, using placeholder`);
      imagePath = createPlaceholderImage(property.id, property.name, "real-estate");
    }

    try {
      // Upload image to IPFS
      console.log(`   📤 Uploading image to IPFS...`);
      const imageCID = await uploadFile(imagePath);

      // Create NFT metadata
      const metadata = createNFTMetadata(
        property.name,
        property.description,
        imageCID,
        property.attributes,
        {
          location: property.location,
          propertyType: property.type,
          propertyId: property.id,
        }
      );

      // Upload metadata to IPFS
      console.log(`   📤 Uploading metadata...`);
      const metadataCID = await uploadJSON(metadata);

      results.realEstate.push({
        propertyId: property.id,
        name: property.name,
        imageCID,
        metadataCID,
        ipfsImageUrl: `ipfs://${imageCID}`,
        ipfsMetadataUrl: `ipfs://${metadataCID}`,
        gatewayImageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        gatewayMetadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCID}`,
      });

      console.log(`   ✅ Complete!`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Process Agriculture properties
  console.log("\n🌾 Agriculture Properties:");
  for (const property of properties.agriculture) {
    console.log(`\n   Processing: ${property.name}`);

    // Look for real image, fallback to placeholder
    let imagePath = findPropertyImage(property.id, "agriculture");
    if (imagePath) {
      console.log(`   ✅ Found image: ${path.basename(imagePath)}`);
    } else {
      console.log(`   ⚠️  No image found, using placeholder`);
      imagePath = createPlaceholderImage(property.id, property.name, "agriculture");
    }

    try {
      console.log(`   📤 Uploading image to IPFS...`);
      const imageCID = await uploadFile(imagePath);

      const metadata = createNFTMetadata(
        property.name,
        property.description,
        imageCID,
        property.attributes,
        {
          location: property.location,
          propertyType: property.type,
          propertyId: property.id,
        }
      );

      console.log(`   📤 Uploading metadata...`);
      const metadataCID = await uploadJSON(metadata);

      results.agriculture.push({
        propertyId: property.id,
        name: property.name,
        imageCID,
        metadataCID,
        ipfsImageUrl: `ipfs://${imageCID}`,
        ipfsMetadataUrl: `ipfs://${metadataCID}`,
        gatewayImageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        gatewayMetadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCID}`,
      });

      console.log(`   ✅ Complete!`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Process Properties
  console.log("\n🏭 Properties (Industrial/Commercial):");
  for (const property of properties.properties) {
    console.log(`\n   Processing: ${property.name}`);

    // Look for real image, fallback to placeholder
    let imagePath = findPropertyImage(property.id, "properties");
    if (imagePath) {
      console.log(`   ✅ Found image: ${path.basename(imagePath)}`);
    } else {
      console.log(`   ⚠️  No image found, using placeholder`);
      imagePath = createPlaceholderImage(property.id, property.name, "properties");
    }

    try {
      console.log(`   📤 Uploading image to IPFS...`);
      const imageCID = await uploadFile(imagePath);

      const metadata = createNFTMetadata(
        property.name,
        property.description,
        imageCID,
        property.attributes,
        {
          location: property.location,
          propertyType: property.type,
          propertyId: property.id,
        }
      );

      console.log(`   📤 Uploading metadata...`);
      const metadataCID = await uploadJSON(metadata);

      results.properties.push({
        propertyId: property.id,
        name: property.name,
        imageCID,
        metadataCID,
        ipfsImageUrl: `ipfs://${imageCID}`,
        ipfsMetadataUrl: `ipfs://${metadataCID}`,
        gatewayImageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        gatewayMetadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCID}`,
      });

      console.log(`   ✅ Complete!`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Save results
  const outputPath = path.join(process.cwd(), "output", "ipfs-cids.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ IPFS Upload Complete!");
  console.log(`\n📄 Results saved to: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Real Estate: ${results.realEstate.length} properties`);
  console.log(`   Agriculture: ${results.agriculture.length} properties`);
  console.log(`   Properties: ${results.properties.length} properties`);
  console.log(`\n💡 Next Steps:`);
  console.log(`   1. Review the IPFS CIDs in output/ipfs-cids.json`);
  console.log(`   2. Use these CIDs when minting new NFTs`);
  console.log(`   3. Replace placeholder images with real property photos`);
  console.log(`   4. Re-upload with real images for production\n`);
}

main();
