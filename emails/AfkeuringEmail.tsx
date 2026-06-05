import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface AfkeuringEmailProps {
  verantwoordelijkeNaam: string;
  werfnaam: string;
  nokTitel: string;
  afkeuringsReden: string;
  link: string;
}

export function AfkeuringEmail({
  verantwoordelijkeNaam,
  werfnaam,
  nokTitel,
  afkeuringsReden,
  link,
}: AfkeuringEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Oplossing afgekeurd — {nokTitel}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={merk}>WERFVERSLAG APP</Text>
          <Heading style={kop}>{werfnaam}</Heading>

          <Text style={tekst}>Dag {verantwoordelijkeNaam},</Text>

          <Text style={tekst}>
            De verslaggever heeft je ingediende oplossing voor het NOK-punt{" "}
            <strong>{nokTitel}</strong> <strong>afgekeurd</strong>.
          </Text>

          <Section style={redenBlok}>
            <Text style={redenLabel}>Reden van afkeuring:</Text>
            <Text style={redenTekst}>{afkeuringsReden}</Text>
          </Section>

          <Text style={tekst}>
            Bekijk het punt via onderstaande knop en dien een nieuwe oplossing in.
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button style={knop} href={link}>
              Bekijk en vink opnieuw af
            </Button>
          </Section>

          <Text style={voet}>
            Je hoeft geen account aan te maken. Deze link is 30 dagen geldig.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AfkeuringEmail;

const body = { backgroundColor: "#f3f4f6", fontFamily: "Arial, sans-serif" };
const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "32px",
  maxWidth: "480px",
  margin: "24px auto",
};
const merk = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#2563EB",
  letterSpacing: "1px",
  margin: "0 0 4px",
};
const kop = { fontSize: "22px", color: "#111827", margin: "0 0 16px" };
const tekst = { fontSize: "14px", color: "#374151", lineHeight: "1.5" };
const redenBlok = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "12px 0",
  borderLeft: "4px solid #ef4444",
};
const redenLabel = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#991b1b",
  margin: "0 0 4px",
};
const redenTekst = { fontSize: "14px", color: "#7f1d1d", margin: "0" };
const knop = {
  backgroundColor: "#2563EB",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
};
const voet = { fontSize: "12px", color: "#9ca3af", marginTop: "24px" };
