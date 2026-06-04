import * as Lucide from "lucide-react";
import { Bot } from "lucide-react";

export function AgentIcon({ name, size = 18, className = "" }: { name?: string | null; size?: number; className?: string }) {
  if (!name) return <Bot className={className} style={{ width: size, height: size }} />;
  const Comp = (Lucide as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[name];
  if (!Comp) return <Bot className={className} style={{ width: size, height: size }} />;
  return <Comp className={className} style={{ width: size, height: size }} />;
}