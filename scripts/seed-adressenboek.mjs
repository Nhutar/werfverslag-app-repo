// Tijdelijk script: wis adressenboek en vul met fictieve contacten
// Uitvoeren: node scripts/seed-adressenboek.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Laad .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const contacten = [
  // Ruwbouw
  { naam: "Pieter Declercq", bedrijf: "Declercq Ruwbouw BV", discipline: "Ruwbouw", email: "p.declercq@ruwbouw.be", telefoon: "0471 12 34 56" },
  { naam: "Jan Vermeersch", bedrijf: "Vermeersch & Zonen", discipline: "Ruwbouw", email: "jan@vermeersch-bouw.be", telefoon: "0478 23 45 67" },
  { naam: "Sofie Bogaert", bedrijf: "Bogaert Constructies", discipline: "Ruwbouw", email: "sofie.bogaert@bogaertconstructies.be", telefoon: "0499 34 56 78" },

  // Dak
  { naam: "Marc Willems", bedrijf: "Willems Dakwerken", discipline: "Dak", email: "marc@willemsdak.be", telefoon: "0476 45 67 89" },
  { naam: "Lieve Smet", bedrijf: "Smet Dak & Zinwerk", discipline: "Dak", email: "lieve@smetdak.be", telefoon: "0468 56 78 90" },
  { naam: "Thomas Claes", bedrijf: "Claes Dakrenovatie", discipline: "Dak", email: "t.claes@claesdak.be", telefoon: "0472 67 89 01" },

  // Buitenschrijnwerk
  { naam: "An Peeters", bedrijf: "Peeters Schrijnwerken", discipline: "Buitenschrijnwerk", email: "an.peeters@peetersschrijnen.be", telefoon: "0474 78 90 12" },
  { naam: "Wim Janssen", bedrijf: "Janssen Ramen & Deuren", discipline: "Buitenschrijnwerk", email: "wim@janssenbuitenschrijn.be", telefoon: "0477 89 01 23" },
  { naam: "Karen Desmet", bedrijf: "Desmet PVC", discipline: "Buitenschrijnwerk", email: "karen.desmet@desmetpvc.be", telefoon: "0465 90 12 34" },

  // Binnenschrijnwerk
  { naam: "Bruno Maes", bedrijf: "Maes Interieur", discipline: "Binnenschrijnwerk", email: "bruno.maes@maesinterieur.be", telefoon: "0473 01 23 45" },
  { naam: "Ellen Cools", bedrijf: "Cools Meubelen & Schrijnwerk", discipline: "Binnenschrijnwerk", email: "ellen@coolsschrijnen.be", telefoon: "0479 12 34 56" },
  { naam: "Niels Wouters", bedrijf: "Wouters Houtwerk", discipline: "Binnenschrijnwerk", email: "niels.wouters@woutershout.be", telefoon: "0481 23 45 67" },

  // Gyproc/Plafond
  { naam: "Dirk Hermans", bedrijf: "Hermans Gyproc", discipline: "Gyproc/Plafond", email: "dirk.hermans@hermansgyproc.be", telefoon: "0482 34 56 78" },
  { naam: "Lies Van Acker", bedrijf: "Van Acker Plafonds", discipline: "Gyproc/Plafond", email: "lies@vanackerplafonds.be", telefoon: "0483 45 67 89" },
  { naam: "Raf Stevens", bedrijf: "Stevens Droogbouw", discipline: "Gyproc/Plafond", email: "raf.stevens@stevensdry.be", telefoon: "0484 56 78 90" },

  // Bepleistering
  { naam: "Katrien Lemmens", bedrijf: "Lemmens Pleisterwerken", discipline: "Bepleistering", email: "katrien@lemmensplt.be", telefoon: "0485 67 89 01" },
  { naam: "Geert Nijs", bedrijf: "Nijs Bepleistering", discipline: "Bepleistering", email: "geert.nijs@nijspleister.be", telefoon: "0486 78 90 12" },
  { naam: "Sara Claeys", bedrijf: "Claeys Afwerking", discipline: "Bepleistering", email: "sara.claeys@claeysafw.be", telefoon: "0487 89 01 23" },

  // Vloerwerken
  { naam: "Koen Martens", bedrijf: "Martens Vloeren", discipline: "Vloerwerken", email: "koen.martens@martensvloeren.be", telefoon: "0488 90 12 34" },
  { naam: "Hilde Baert", bedrijf: "Baert Parket & Tegels", discipline: "Vloerwerken", email: "hilde.baert@baertvloer.be", telefoon: "0489 01 23 45" },
  { naam: "David Cops", bedrijf: "Cops Vloerafwerking", discipline: "Vloerwerken", email: "david.cops@copsvloer.be", telefoon: "0490 12 34 56" },

  // Schilderwerken
  { naam: "Filip Dubois", bedrijf: "Dubois Schilders", discipline: "Schilderwerken", email: "filip.dubois@duboisschilder.be", telefoon: "0491 23 45 67" },
  { naam: "Nathalie Goossens", bedrijf: "Goossens Kleur & Verf", discipline: "Schilderwerken", email: "nathalie@goossensverf.be", telefoon: "0492 34 56 78" },
  { naam: "Yves Pieters", bedrijf: "Pieters Decoratie", discipline: "Schilderwerken", email: "yves.pieters@pietersdecos.be", telefoon: "0493 45 67 89" },

  // Elektriciteit
  { naam: "Luc Vandenberghe", bedrijf: "Vandenberghe Elektro", discipline: "Elektriciteit", email: "luc@vandenberghe-elektro.be", telefoon: "0494 56 78 90" },
  { naam: "Annemie Put", bedrijf: "Put Elektriciteitswerken", discipline: "Elektriciteit", email: "annemie.put@putelektro.be", telefoon: "0495 67 89 01" },
  { naam: "Stef Aerts", bedrijf: "Aerts Installaties", discipline: "Elektriciteit", email: "stef.aerts@aertsinstall.be", telefoon: "0496 78 90 12" },

  // HVAC
  { naam: "Michaël Vanden Broeck", bedrijf: "VDB Klimaattechniek", discipline: "HVAC", email: "michael@vdbklimaat.be", telefoon: "0497 89 01 23" },
  { naam: "Griet Claerhout", bedrijf: "Claerhout HVAC", discipline: "HVAC", email: "griet.claerhout@claerhouthvac.be", telefoon: "0498 90 12 34" },
  { naam: "Jonas Desroches", bedrijf: "Desroches Verwarming", discipline: "HVAC", email: "jonas@desrochesverwarming.be", telefoon: "0499 01 23 45" },

  // Ventilatie
  { naam: "Veerle Hermans", bedrijf: "Hermans Ventilatie", discipline: "Ventilatie", email: "veerle.hermans@hermansvent.be", telefoon: "0470 12 34 56" },
  { naam: "Ben Leclercq", bedrijf: "Leclercq Luchtbehandeling", discipline: "Ventilatie", email: "ben.leclercq@leclercqlucht.be", telefoon: "0471 23 45 67" },
  { naam: "Annelies Moens", bedrijf: "Moens Ventilatiesystemen", discipline: "Ventilatie", email: "annelies.moens@moensvent.be", telefoon: "0472 34 56 78" },

  // Sanitair
  { naam: "Peter Van Den Berg", bedrijf: "Van Den Berg Sanitair", discipline: "Sanitair", email: "peter@vandenbergsanitair.be", telefoon: "0473 45 67 89" },
  { naam: "Eva Willekens", bedrijf: "Willekens Bad & Keuken", discipline: "Sanitair", email: "eva.willekens@willekenssan.be", telefoon: "0474 56 78 90" },
  { naam: "Glenn Sys", bedrijf: "Sys Loodgieterij", discipline: "Sanitair", email: "glenn.sys@syslood.be", telefoon: "0475 67 89 01" },

  // Verlichting
  { naam: "Isabelle Corthout", bedrijf: "Corthout Lichtontwerp", discipline: "Verlichting", email: "isabelle@corthoutlicht.be", telefoon: "0476 78 90 12" },
  { naam: "Ruben Mertens", bedrijf: "Mertens Verlichting", discipline: "Verlichting", email: "ruben.mertens@mertenslight.be", telefoon: "0477 89 01 23" },
  { naam: "Tine Soete", bedrijf: "Soete LED Solutions", discipline: "Verlichting", email: "tine.soete@soeteled.be", telefoon: "0478 90 12 34" },

  // Andere
  { naam: "Hans Decloedt", bedrijf: "Decloedt Afbraak", discipline: "Andere", email: "hans.decloedt@decloedt.be", telefoon: "0479 01 23 45" },
  { naam: "Marie Debacker", bedrijf: "Debacker Landmeten", discipline: "Andere", email: "marie.debacker@debacker.be", telefoon: "0480 12 34 56" },
  { naam: "Sam Fierens", bedrijf: "Fierens Kraanverhuur", discipline: "Andere", email: "sam.fierens@fierenskraan.be", telefoon: "0481 23 45 67" },
];

async function main() {
  console.log("🗑️  Bestaande contacten verwijderen...");
  // Ontkoppel eerst deelnemers
  await prisma.projectDeelnemer.updateMany({ data: { adresboekContactId: null } });
  await prisma.adresboekContact.deleteMany();
  console.log("✅ Adressenboek leeg.");

  console.log(`📋 ${contacten.length} fictieve contacten aanmaken...`);
  for (const c of contacten) {
    await prisma.adresboekContact.create({ data: c });
    process.stdout.write(".");
  }
  console.log("\n✅ Klaar!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
