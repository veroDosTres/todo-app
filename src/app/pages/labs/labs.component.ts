import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './labs.component.html',
  styleUrl: './labs.component.css'
})
export class LabsComponent {
  welcome = 'Hola!';
  tasks = signal([
    'Instalar Angular CLI',
    'Crear proyecto',
    'Crear componentes',
    'Crear servicio'
  ]);
// Así se define un signal
  name = signal('Vero');
  age = 35;

  person = signal({
    name: 'Vero',
    age: 35,
    avatar: 'https://pixabay.com/get/g0a5be9cf0161b1f4cb94659c38fbac2bdf78964a25eac0d2d6eb1fdaeab6e90b04646c281350758b58afa08a5e3dd1a69e06afdde913b5f1463a65a6533900796929c59f58c0f250960734098a8f4b05_640.png'
  });

  //Formularios reactivos
  colorCtrl = new FormControl();
  widthCtrl = new FormControl(50, {
    nonNullable: true
  })
  nameCtrl = new FormControl('Veronica', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(3)
    ]
    
  })

  //También podemos leer los valores de un FormControl desde la lógica y verlo en la consola
  constructor() {
    this.colorCtrl.valueChanges.subscribe(value =>
      console.log(value)
    );
  }

  clickHandler() {
    alert('Hola');
  }

// Puede recibir el evento con el objeto Event
  changeHandler(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    this.name.set(newValue);
  }
// Tambien existe el objeto KeyboardEvent
  keydownHandler(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    console.log(input.value);
  }

  changeAge(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    this.person.update((prevState) => {
      return {
        ...prevState,
        age: parseInt(newValue)
      }
    });
  }

  changeName(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    this.person.update((prevState) => {
      return {
        ...prevState,
        name: newValue
      }
    });
  }
}
