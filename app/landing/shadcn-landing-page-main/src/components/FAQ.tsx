import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Is there are practice mode in the Challenge",
    answer: "Yes. You can choose between practice and exam mode.",
    value: "item-1",
  },
  {
    question: "Can you read others' writing Challenge?",
    answer:
      "Only if they allow people to reveal it in public.",
    value: "item-2",
  },
  {
    question:
      "Can I compete with a friend in the same Challenge?",
    answer:
      "We're working on it.",
    value: "item-3",
  },
  {
    question: "Will there be future exercises?",
    answer: "We're definitely going to add more.",
    value: "item-4",
  },
  {
    question:
      "How is the writing challenge graded?",
    answer:
      "We're using AI to grade your writing.",
    value: "item-5",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="mailto:zoom.flux@gmail.com"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
