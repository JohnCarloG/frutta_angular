import { TestBed } from '@angular/core/testing';
import { StudenteCard } from './studente-card';

const studente = { id: 2, nome: 'Sara Rossi', classe: '4B', mediaVoti: 5.8 };

describe('StudenteCard', () => {
  it('emette lo studente quando viene richiesta la rimozione', async () => {
    await TestBed.configureTestingModule({
      imports: [StudenteCard],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudenteCard);
    fixture.componentRef.setInput('studente', studente);
    const rimosso = vi.fn();
    fixture.componentInstance.rimosso.subscribe(rimosso);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.text-danger')?.textContent).toContain('5.8');
    root.querySelector('button')!.click();
    expect(rimosso).toHaveBeenCalledWith(studente);
  });

  it('nasconde le azioni quando il padre passa false', async () => {
    await TestBed.configureTestingModule({
      imports: [StudenteCard],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudenteCard);
    fixture.componentRef.setInput('studente', studente);
    fixture.componentRef.setInput('azioni', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
