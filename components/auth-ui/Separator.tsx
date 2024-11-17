export default function Separator(props: { text?: string }) {
  const { text } = props;
  return (
    <div className="relative my-6 w-full">
      <div className="relative flex w-full items-center py-1">
        <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
        {text && (
          <span className="mx-3 shrink text-sm leading-8 text-zinc-500">
            {text}
          </span>
        )}
        <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
      </div>
    </div>
  );
}
