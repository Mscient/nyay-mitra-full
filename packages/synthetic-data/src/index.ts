import { fakerEN_IN as faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";

// Generate synthetic advocates
const generateAdvocates = (count: number) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    fullName: faker.person.fullName(),
    bciNumber: `MAH/${faker.number.int({ min: 1000, max: 9999 })}/${faker.number.int({ min: 2000, max: 2023 })}`,
    email: faker.internet.email(),
    phone: faker.phone.number(),
    stateCouncil: "BCI-MH",
    practiceAreas: faker.helpers.arrayElements(["CRIMINAL", "CIVIL", "CORPORATE", "FAMILY", "TAX"], 2),
    city: faker.location.city(),
  }));
};

// Generate synthetic clients
const generateClients = (count: number) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    aadhaarMasked: `XXXX-XXXX-${faker.number.int({ min: 1000, max: 9999 })}`,
    address: faker.location.streetAddress(),
  }));
};

const outputDir = path.join(__dirname, "../output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Generating synthetic data...");
const advocates = generateAdvocates(50);
const clients = generateClients(100);

fs.writeFileSync(path.join(outputDir, "advocates.json"), JSON.stringify(advocates, null, 2));
fs.writeFileSync(path.join(outputDir, "clients.json"), JSON.stringify(clients, null, 2));

console.log("Synthetic data generation complete. Saved to output/");
