import type { Metadata } from 'next';
import { experienceSettings } from '../feriaEffix2026/_lib/server';
import { DiagnosticJourney } from '../AuditoríaEffix/diagnostic/journey';

export const dynamic = 'force-dynamic';
export const metadata:Metadata={
 title:'Auditoría digital · Groovy + BotPager · Feria Effix',
 description:'Descubre tus prioridades digitales y un plan de acción con Groovy y BotPager. Beneficio del 50% OFF por estar en Feria Effix.',
 alternates:{canonical:'/es/Auditor%C3%ADaEffix'},
 openGraph:{title:'Tu diagnóstico digital · Feria Effix',description:'Siete áreas de oportunidad y un plan personalizado para tu negocio.',url:'/es/Auditor%C3%ADaEffix',locale:'es_419'},
};
export default function Page(){return <DiagnosticJourney settings={experienceSettings()}/>;}
