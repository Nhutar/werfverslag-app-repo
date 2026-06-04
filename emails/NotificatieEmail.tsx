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

export interface NokPuntRegel {
  titel: string;
  deadline: string; // reeds geformatteerd
}

export interface NotificatieEmailProps {
  verantwoordelijkeNaam: string;
  werfnaam: string;
  punten: NokPuntRegel[];
  link: string;
}

export function NotificatieEmail({
  verantwoordelijkeNaam,
  werfnaam,
  punten,
  link,
}: NotificatieEmailProps) {
  const heeftPunten = punten.length > 0;

  return (
    <Html>
      <Head />
      <Preview>
        {heeftPunten
          ? `Je hebt openstaande NOK-punten op werf ${werfnaam}`
          : `Werfverslag voor werf ${werfnaam}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={merk}>WERFVERSLAG APP</Text>
          <Heading style={kop}>{werfnaam}</Heading>

          <Text style={tekst}>Dag {verantwoordelijkeNaam},</Text>

          {heeftPunten ? (
            <>
              <Text style={tekst}>
                Er zijn NOK-punten waarvoor jij verantwoordelijk bent op werf{" "}
                <strong>{werfnaam}</strong>:
              </Text>
              <Section style={lijst}>
                {punten.map((p, i) => (
                  <Text key={i} style={lijstItem}>
                    • <strong>{p.titel}</strong> — deadline {p.deadline}
                  </Text>
                ))}
              </Section>
            </>
          ) : (
            <Text style={tekst}>
              Je bent op de hoogte gebracht van het werfverslag voor{" "}
              <strong>{werfnaam}</strong>.
            </Text>
          )}

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button style={knop} href={link}>
              Bekijk en vink af
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

export default NotificatieEmail;

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
const lijst = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "12px 0",
};
const lijstItem = { fontSize: "14px", color: "#374151", margin: "4px 0" };
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
