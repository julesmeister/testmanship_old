import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";
import { HeroCards } from "./HeroCards";
import { redirect } from 'next/navigation';

const login = () => {
  return redirect("/dashboard/signin")
}
export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
              Practice
            </span>{" "}
            your{" "}
          </h1>{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              language
            </span>{" "}
            skills
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          This is a place where you can improve and prepare for your language
          exams.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Button onClick={login} className="w-full md:w-1/3">Get Started</Button>

       
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
