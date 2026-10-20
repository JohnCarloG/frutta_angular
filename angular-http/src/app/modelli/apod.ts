export interface Apod {
  readonly date: string;
  readonly title: string;
  readonly explanation: string;
  readonly url: string;
  readonly media_type: string;
  readonly copyright?: string;
}
