import { PencilRuler } from "lucide-react";
import { buttonVariants } from "../ui/button";

export default function Logo() {
  return (
    <div className={buttonVariants({ variant: "ghost", size: "icon" })}>
      <PencilRuler />
    </div>
  );
}
