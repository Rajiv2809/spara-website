import { useEffect, useState } from "react";
import atina from "../assets/foto/atina.jpeg";
import rajiv from "../assets/foto/rajiv.jpeg";
import zaky from "../assets/foto/zaky.jpeg";
import stevan from "../assets/foto/stevan.jpeg";
import angel from "../assets/foto/angel.jpeg";
import pak_gilang from "../assets/foto/pak_gilang.jpg";

const member_suki = [
  {
    name: "Zaky Alamsyah Putra Ifgabrata",
    nim: "4342501029",
    instagram: "https://instagram.com/alamsyhz_",
    foto: zaky
  },
  {
    name: "Rajiv Tajusa David",
    nim: "4342501028",
    instagram: "https://instagram.com/jiibb_td",
    foto: rajiv
  },
  {
    name: "Stevan Akbar",
    nim: "4342101006",
    instagram: "https://instagram.com/evand_a1",
    foto: stevan
  },
  {
    name: "Angelica Sun",
    nim: "4342101018",
    instagram: "https://instagram.com/anngelicaaa._",
    foto: angel
  },
  {
    name: "Atina Zahara",
    nim: "4342101005",
    instagram: "https://instagram.com/atina.zhr",
    foto: atina
  },
];

const pak_mr_manpro = {
  name: "Gilang Bagus Ramadhan, A.Md.Kom.",
  title: "lecturer dan Laboran department Teknik Informatika",
  foto: pak_gilang
};

const css = `
  :root {
    --pink: #e11d48;
    --pink-dark: #9f1239;
    --pink-light: #f472b6;
    --maroon: #881337;
    --accent: #f43f5e;
    --bg: #09090b;
    --card: rgba(15, 15, 23, 0.92);
    --glass: rgba(39, 39, 42, 0.6);
    --border: #3f3f46;
    --text: #ffffff;
    --muted: #a3a3a3;
  }

  .ti-root {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    color: white;
    background: 
      radial-gradient(circle at 18% 28%, rgba(244, 114, 182, 0.28) 0%, transparent 60%),
      radial-gradient(circle at 82% 42%, rgba(159, 18, 57, 0.24) 0%, transparent 60%),
      linear-gradient(145deg, #12090f 0%, #26101a 100%);
    position: relative;
    overflow: hidden;
  }

  .ti-root::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at 50% 20%, rgba(244, 63, 94, 0.06), transparent);
    pointer-events: none;
  }

  .ti-hero {
    text-align: center;
    padding: 90px 20px 60px;
  }

  .ti-h1 {
    font-size: clamp(38px, 8vw, 68px);
    font-weight: 850;
    letter-spacing: -0.03em;
    background: linear-gradient(90deg, #fff, var(--pink-light), #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 18px;
  }

  .ti-hero-sub {
    color: var(--muted);
    font-size: 16.5px;
    max-width: 620px;
    margin: 0 auto;
    line-height: 1.75;
  }

  .ti-divider {
    width: 90px;
    height: 4px;
    background: linear-gradient(to right, var(--pink), var(--maroon), var(--pink));
    margin: 55px auto;
    border-radius: 9999px;
    box-shadow: 0 0 15px rgba(225, 29, 72, 0.4);
  }

  .ti-sec-label {
    text-align: center;
    margin-bottom: 45px;
  }

  .ti-sec-label h2 {
    font-size: 29px;
    font-weight: 700;
    background: linear-gradient(90deg, #fff, var(--pink-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .ti-supervisor {
    max-width: 460px;
    margin: 0 auto 80px;
    padding: 40px 32px;
    background: var(--glass);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(225, 29, 72, 0.25);
    border-radius: 28px;
    text-align: center;
    box-shadow: 0 25px 60px -15px rgba(159, 18, 57, 0.35);
    transition: all 0.4s ease;
  }

  .ti-supervisor:hover {
    border-color: var(--pink);
    box-shadow: 0 30px 70px -10px rgba(225, 29, 72, 0.45);
    transform: translateY(-8px);
  }

  .ti-sup-avatar {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    margin: 0 auto 24px;
    padding: 6px;
    background: linear-gradient(135deg, var(--pink), var(--maroon));
    box-shadow: 0 0 30px rgba(225, 29, 72, 0.5);
  }

  .ti-sup-avatar-inner {
    width: %;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #18181b;
  }

  .ti-sup-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ti-members {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .ti-row {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .ti-card {
    background: var(--card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 32px 24px 28px;
    width: 270px;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .ti-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent, rgba(225,29,72,0.08), transparent);
    opacity: 0;
    transition: opacity 0.4s;
  }

  .ti-card:hover {
    transform: translateY(-18px) scale(1.06);
    border-color: var(--pink);
    box-shadow: 0 35px 80px -20px rgba(225, 29, 72, 0.4);
  }

  .ti-card:hover::before {
    opacity: 1;
  }

  .ti-avatar {
    width: 150px;
    height: 150px;
    margin: 0 auto 20px;
    padding: 5px;
    background: linear-gradient(135deg, var(--pink), var(--maroon), var(--pink-light));
    border-radius: 50%;
    box-shadow: 0 0 25px rgba(225, 29, 72, 0.4);
    transition: all 0.4s ease;
  }

  .ti-card:hover .ti-avatar {
    transform: rotate(8deg) scale(1.12);
    box-shadow: 0 0 40px rgba(225, 29, 72, 0.6);
  }

  .ti-avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #18181b;
  }

  .ti-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .ti-card:hover .ti-avatar img {
    transform: scale(1.1);
  }

  .ti-card-name {
    font-size: 16.5px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 6px;
  }

  .ti-nim {
    font-size: 13px;
    color: var(--pink-light);
    margin-bottom: 16px;
    font-weight: 500;
  }

  .ti-ig {
    font-size: 13.5px;
    color: var(--pink-light);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s;
  }

  .ti-card:hover .ti-ig {
    color: #fff;
  }

  .ti-footer {
    text-align: center;
    margin-top: 100px;
    padding: 50px 20px 40px;
    font-size: 13.5px;
    color: var(--muted);
    border-top: 1px solid rgba(63, 63, 70, 0.5);
  }
`;

function MemberCard({ member }) {
  return (
    <div
      className="ti-card"
      onClick={() => window.open(member.instagram, "_blank")}
    >
      <div className="ti-avatar">
        <div className="ti-avatar-inner">
          <img src={member.foto} alt={member.name} />
        </div>
      </div>
      <div className="ti-card-name">{member.name}</div>
      <div className="ti-nim">{member.nim}</div>
      <div className="ti-ig">Lihat Instagram ↗</div>
    </div>
  );
}

function ManproCard({ pak_mr_manpro }) {
  return (
    <div className="ti-supervisor">
      <div className="ti-sup-avatar">
        <div className="ti-sup-avatar-inner">
          <img src={pak_mr_manpro.foto} alt={pak_mr_manpro.name} />
        </div>
      </div>
      <div style={{ fontSize: "18.5px", fontWeight: 700, marginBottom: "10px" }}>
        {pak_mr_manpro.name}
      </div>
      <div style={{ 
        fontSize: "14.5px", 
        color: "#d1d5db", 
        whiteSpace: "pre-line", 
        lineHeight: 1.6 
      }}>
        {pak_mr_manpro.title}
      </div>
    </div>
  );
}

export default function TeamIntro() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <style>{css}</style>
      <div className="ti-root" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease' }}>

        <section className="ti-hero">
          <h1 className="ti-h1">Tim Pengembang SPARA Polibatam</h1>
          <p className="ti-hero-sub">
            Aplikasi ini dikembangkan oleh Tim PBL-TRPL209 yang merupakan mahasiswa program studi Teknik Rekayasa Perangkat Lunak. SPARA Polibatam merupakan solusi cerdas untuk loan serta pendataan tool dan room di Politeknik Negeri Batam.
          </p>
        </section>

        <div className="ti-divider" />

        <div className="ti-sec-label">
          <h2>Manajer Proyek</h2>
        </div>
        <ManproCard pak_mr_manpro={pak_mr_manpro} />

        <div className="ti-divider" />

        <div className="ti-sec-label">
          <h2>Anggota Tim PBL-TRPL209</h2>
        </div>

        <div className="ti-members">
          <div className="ti-row">
            {member_suki.slice(0, 3).map((m) => (
              <MemberCard key={m.nim} member={m} />
            ))}
          </div>
          <div className="ti-row">
            {member_suki.slice(3).map((m) => (
              <MemberCard key={m.nim} member={m} />
            ))}
          </div>
        </div>

        <div className="ti-footer">
          © 2026 Tim PBL-TRPL209 • Politeknik Negeri Batam
        </div>
      </div>
    </>
  );
}