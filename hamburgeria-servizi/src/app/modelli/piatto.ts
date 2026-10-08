export interface Piatto {
  readonly id: number;
  readonly nome: string;
  readonly prezzo: number;
}

export interface RigaOrdine {
  readonly piatto: Piatto;
  readonly quantita: number;
}

export const MENU: readonly Piatto[] = [
  { id: 1, nome: 'Hamburger classico', prezzo: 8.5 },
  { id: 2, nome: 'Cheeseburger', prezzo: 9 },
  { id: 3, nome: 'Burger vegetariano', prezzo: 9.5 },
  { id: 4, nome: 'Patatine', prezzo: 3.5 },
  { id: 5, nome: 'Bibita', prezzo: 2.5 },
];
