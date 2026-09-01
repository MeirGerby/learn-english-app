import { Link } from "react-router-dom";
import {
  Sparkles,
  GraduationCap,
  Gamepad2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

// HighTalk Design System Imports
import {
  PageShell,
  BrandHeader,
  BrandHero,
  BrandBadge,
  SectionHeading,
  BrandActionCard,
  BrandCard,
} from "@/components/ui";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle("הודיה ג'רבי | מומחית לרכישת שפה והוראת אנגלית");

  return (
    <PageShell>
      <BrandHeader />

      <main className="pt-6 sm:pt-10 flex flex-col gap-10">
        {/* =====================================================
            HERO SECTION
        ====================================================== */}
        <BrandHero className="bg-white border border-slate-200 shadow-sm text-slate-900">
          <BrandBadge icon={Sparkles} className="bg-rose-50 text-rose-600 border border-rose-200">
            ללמוד אנגלית אחרת
          </BrandBadge>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2">
            הודיה ג'רבי
          </h1>

          <p className="text-rose-600 font-bold text-lg sm:text-xl">
            מומחית לרכישת שפה והוראת אנגלית
          </p>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            שיטת לימוד חדשנית המשלבת טכניקות מבוססות מחקר, חוויית משחק אינטראקטיבית
            ולמידה מותאמת אישית לכל רמה.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <BrandBadge icon={GraduationCap} className="bg-slate-100 text-slate-700">
              B.Ed בהוראת אנגלית
            </BrandBadge>
            <BrandBadge icon={CheckCircle2} className="bg-slate-100 text-slate-700">
              ניסיון מוכח בלמידה מותאמת
            </BrandBadge>
          </div>
        </BrandHero>

        {/* =====================================================
            LEARNING PATHWAYS SECTION
        ====================================================== */}
        <section className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="HIGHTALK"
            title="הדרך שלך ללמוד"
            description="בחרו את מסלול הלימוד המתאים ביותר עבורכם"
          />

          <div className="flex flex-col gap-4">
            {/* Primary Action Card - Games */}
            <BrandActionCard
              to="/games"
              icon={Gamepad2}
              variant="primary"
              title="משחקי למידה"
              description="תרגול אנגלית דרך משחק, אתגר והנאה - מותאם לרמה האישית שלכם"
              badgeText="מומלץ להתחיל כאן"
              className="bg-gradient-to-r from-rose-50 via-white to-white border-rose-200 shadow-sm hover:border-rose-300"
            />

            {/* Secondary Action Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <BrandActionCard
                to="/course"
                icon={BookOpen}
                title="הקורס של הודיה"
                description="תכנית הלימודים המלאה לשיפור הדיבור והבנת השפה"
                className="ht-card-hover"
              />

              <BrandActionCard
                to="/materials"
                icon={FileText}
                title="חומרי לימוד"
                description="דפי עבודה, סיכומים וחומרי תרגול להורדה"
                className="ht-card-hover"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY HIGHTALK FEATURE SECTION
        ====================================================== */}
        <section className="mt-4">
          <BrandCard className="ht-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-right">
                <span className="text-xs font-bold text-rose-600 tracking-wider uppercase">
                  למה HighTalk?
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  רוצים לדעת איפה להתחיל?
                </h3>
                <p className="text-sm text-slate-600 max-w-md">
                  קחו מבחן רמה קצר ולקבלת המלצות מותאמות אישית למשחקים ולתכנים המתאימים בדיוק עבורכם.
                </p>
              </div>

              <Link
                to="/placement-test"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-6
                  py-3.5
                  rounded-xl
                  font-bold
                  text-sm
                  ht-primary
                  shrink-0
                  ht-focus
                "
              >
                <span>התחילו מבחן רמה</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </BrandCard>
        </section>
      </main>
    </PageShell>
  );
}