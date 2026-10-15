import { CallButton, WhatsAppButton } from "./Buttons";

export function CtaBand({ title, message }: { title: string; message?: string }) {
  return (
    <section className="on-dark bg-blue text-white">
      <div className="container-site flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display max-w-xl text-4xl md:text-5xl">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton message={message} />
          <CallButton tone="dark" />
        </div>
      </div>
    </section>
  );
}
