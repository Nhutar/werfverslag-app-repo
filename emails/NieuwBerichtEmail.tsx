import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface NieuwBerichtEmailProps {
  verantwoordelijkeNaam: string;
  werfnaam: string;
  nokTitel: string;
  auteurNaam: string;
  tekst: string;
  link: string;
}

export function NieuwBerichtEmail({ verantwoordelijkeNaam, werfnaam, nokTitel, auteurNaam, tekst, link }: NieuwBerichtEmailProps) {
  return (
    <Html><Head />
      <Preview>Nieuw bericht over {nokTitel}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={merk}>WERFVERSLAG APP</Text>
          <Heading style={kop}>{werfnaam}</Heading>
          <Text style={tekst_stijl}>Dag {verantwoordelijkeNaam},</Text>
          <Text style={tekst_stijl}>
            Er is een nieuw bericht over het NOK-punt <strong>{nokTitel}</strong>:
          </Text>
          <Section style={berichtBlok}>
            <Text style={berichtAuteur}>{auteurNaam}:</Text>
            <Text style={berichtTekst}>{tekst}</Text>
          </Section>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button style={knop} href={link}>Bekijk en reageer</Button>
          </Section>
          <Text style={voet}>Je hoeft geen account aan te maken. Deze link is 30 dagen geldig.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NieuwBerichtEmail;

const body = { backgroundColor: "#f3f4f6", fontFamily: "Arial, sans-serif" };
const container = { backgroundColor: "#fff", borderRadius: "12px", padding: "32px", maxWidth: "480px", margin: "24px auto" };
const merk = { fontSize: "12px", fontWeight: "bold" as const, color: "#2563EB", letterSpacing: "1px", margin: "0 0 4px" };
const kop = { fontSize: "22px", color: "#111827", margin: "0 0 16px" };
const tekst_stijl = { fontSize: "14px", color: "#374151", lineHeight: "1.5" };
const berichtBlok = { backgroundColor: "#F3F4F6", borderRadius: "8px", padding: "12px 16px", margin: "12px 0", borderLeft: "4px solid #3B82F6" };
const berichtAuteur = { fontSize: "12px", fontWeight: "bold" as const, color: "#1D4ED8", margin: "0 0 4px" };
const berichtTekst = { fontSize: "14px", color: "#374151", margin: "0" };
const knop = { backgroundColor: "#2563EB", color: "#fff", fontSize: "14px", fontWeight: "bold" as const, padding: "12px 24px", borderRadius: "8px", textDecoration: "none" };
const voet = { fontSize: "12px", color: "#9CA3AF", marginTop: "24px" };
