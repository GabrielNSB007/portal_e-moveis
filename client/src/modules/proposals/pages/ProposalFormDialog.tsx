import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button";
import { Input, Textarea } from "@/shared/components/Field";
import { getApiErrorMessage } from "@/shared/api/httpClient";
import { createProposal } from "../api/proposalsApi";

type ProposalFormDialogProps = {
  offerId: string;
  offerTitle: string;
  onClose: () => void;
};

export function ProposalFormDialog({ offerId, offerTitle, onClose }: ProposalFormDialogProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("Tenho interesse no imóvel. Podemos conversar?");
  const [value, setValue] = useState("");

  const mutation = useMutation({
    mutationFn: () => createProposal({ offerId, message, value: value ? Number(value) : null }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["proposals"] }),
        queryClient.invalidateQueries({ queryKey: ["matches"] }),
      ]);
      toast.success("Proposta enviada ao vendedor.");
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-border bg-card p-6 shadow-card">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Contato com vendedor</p>
          <h2 className="mt-2 text-2xl font-extrabold text-foreground">Enviar proposta</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{offerTitle}</p>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <Textarea label="Mensagem" value={message} onChange={(event) => setMessage(event.target.value)} />
          <Input label="Valor da proposta" type="number" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ex: 420000" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Enviar proposta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
