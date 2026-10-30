import { Anek_Bangla, Anek_Latin, Galada, Martian_Mono } from "next/font/google";

export const brush = Galada({ weight: "400", subsets: ["bengali", "latin"], variable: "--font-brush", display: "swap" });
export const anekLatin = Anek_Latin({ subsets: ["latin"], axes: ["wdth"], variable: "--font-anek-latin", display: "swap" });
export const anekBangla = Anek_Bangla({ subsets: ["bengali"], axes: ["wdth"], variable: "--font-anek-bangla", display: "swap" });
export const mono = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-mono", display: "swap" });

export const fontVars = [brush.variable, anekLatin.variable, anekBangla.variable, mono.variable].join(" ");
