import { UserInputForm } from "@/components/user-input-form"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <h1 className="text-xl font-bold">FeatureAnalyzer</h1>
          </div>
          <ThemeSwitcher />
        </header>

        <main className="mx-auto max-w-4xl">
          <section className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">Feature-based Prediction</h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground md:text-lg">
              Input numeric features or upload an image to get predictions from our advanced machine learning model.
            </p>
          </section>

          <UserInputForm />
        </main>
      </div>
    </div>
  )
}
