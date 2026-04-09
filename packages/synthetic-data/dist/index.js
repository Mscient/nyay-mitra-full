"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Generate synthetic advocates
const generateAdvocates = (count) => {
    return Array.from({ length: count }).map(() => ({
        id: faker_1.fakerEN_IN.string.uuid(),
        fullName: faker_1.fakerEN_IN.person.fullName(),
        bciNumber: `MAH/${faker_1.fakerEN_IN.number.int({ min: 1000, max: 9999 })}/${faker_1.fakerEN_IN.number.int({ min: 2000, max: 2023 })}`,
        email: faker_1.fakerEN_IN.internet.email(),
        phone: faker_1.fakerEN_IN.phone.number(),
        stateCouncil: "BCI-MH",
        practiceAreas: faker_1.fakerEN_IN.helpers.arrayElements(["CRIMINAL", "CIVIL", "CORPORATE", "FAMILY", "TAX"], 2),
        city: faker_1.fakerEN_IN.location.city(),
    }));
};
// Generate synthetic clients
const generateClients = (count) => {
    return Array.from({ length: count }).map(() => ({
        id: faker_1.fakerEN_IN.string.uuid(),
        fullName: faker_1.fakerEN_IN.person.fullName(),
        email: faker_1.fakerEN_IN.internet.email(),
        phone: faker_1.fakerEN_IN.phone.number(),
        aadhaarMasked: `XXXX-XXXX-${faker_1.fakerEN_IN.number.int({ min: 1000, max: 9999 })}`,
        address: faker_1.fakerEN_IN.location.streetAddress(),
    }));
};
const outputDir = path_1.default.join(__dirname, "../output");
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
}
console.log("Generating synthetic data...");
const advocates = generateAdvocates(50);
const clients = generateClients(100);
fs_1.default.writeFileSync(path_1.default.join(outputDir, "advocates.json"), JSON.stringify(advocates, null, 2));
fs_1.default.writeFileSync(path_1.default.join(outputDir, "clients.json"), JSON.stringify(clients, null, 2));
console.log("Synthetic data generation complete. Saved to output/");
