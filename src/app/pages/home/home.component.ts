import { Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from './../../models/task.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Aquí incluímos los estados y los métodos
  tasks = signal<Task[]>([]);

  // Para evitarnos errores tipando podemos agregar los valores válidos entre <>
  filter = signal<'all' | 'pending' | 'completed'>('all');
  /* Estados computados o derivados de otros (computed). Computed retorna un valor 
     (generando un nuevo signal) a partir de los cambios de estado. Por ejemplo 
     retornar las tareas filtradas por su estado filter*/
  tasksByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'pending') {
      return tasks.filter((task) => !task.completed);
    } else if (filter === 'completed') {
      return tasks.filter((task) => task.completed);
    } else {
      return tasks;
    }
  });

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required
    ]
  });

  /* La reactividad en Angular se compone de signal, computed y effect. Effect se puede 
     instanciar a través del constructor. Trackea los cambios en los estados y permite
     ejecutar una lógica a partir de ellos, ej: Cuando alguna tarea cambie la guarda en 
     el localStorage*/
  /*constructor() {
    effect(() => {
      const tasks = this.tasks();
      console.log(tasks);
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }, {}) 
  }*/

  injector = inject(Injector);

  // Para recuperar lo que guardamos en localStorage
  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
        try {
            const tasks = JSON.parse(storage); // Intenta parsear el JSON
            this.tasks.set(tasks); // Si es válido, lo asigna
        } catch (error) {
            console.error('Error al parsear tareas del localStorage:', error);
            // Limpia el localStorage si los datos están corruptos
            localStorage.removeItem('tasks');
        }
    } 
    this.trackTasks();
  }

  /*Movemos el effect a una función porque si no se borra todo. 
    Cuando el effect no está en el constructor tenemos que inyectarlo
    con un Injector (linea 41)*/
  trackTasks() {
    effect(() => {
      const tasks = this.tasks(); // Obtiene las tareas
      console.log('Tareas actuales:', tasks);
      try {
          // Guarda solo si las tareas tienen un formato válido
          localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
          console.error('Error al guardar tareas en localStorage:', error);
      }
  }, { injector: this.injector });
  }

  /*changeHandler(event: Event) {
    const input = event.target as HTMLInputElement;
    const newTask = input.value;
    this.addTask(newTask);
    input.value = ''
  }*/
  
  changeHandler() {
    if(this.newTaskCtrl.valid && this.newTaskCtrl.value.trim() !== '') {
      const value = this.newTaskCtrl.value;
      this.addTask(value.trim());
      this.newTaskCtrl.setValue('');
    }
  }

  addTask(title: string) {
    const newTask = {
      id: Date.now(),
      title,
      completed: false
    }
    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  deleteTask(id: number) {
    this.tasks.update((tasks) => tasks.filter((tasks) => tasks.id !== id));
  }

  toggleCompleted(index: number) {
    this.tasks.update((tasks) =>
    tasks.map((task, position) => {
      if(position === index) {
        task.completed = !task.completed;
      }
      return task;
    }))}

    /*updateTask(index: number) {
      this.tasks.update((tasks) => {
        return tasks.map((task, position) => {
          if (position === index) {
            return {
              ...task,
              completed: !task.completed
            }
          }
          return task;
        });
      })
    }*/
    updateTaskEditingMode(index: number) {
      if (this.tasks()[index].completed) return;
      this.tasks.update((tasks) => {
        return tasks.map((task, position) => {
          if (position === index) {
            return {
              ...task,
              editing: true
            }
          }
          return {
            ...task,
            editing: false
          };
        });
      })
    }

    updateTaskText(index: number, event: Event) {
      const input = event.target as HTMLInputElement;
      const newValue = input.value;
      this.tasks.update((tasks) => {
        return tasks.map((task, position) => {
          if (position === index) {
            return {
              ...task,
              title: newValue,
              editing: false
            }
          }
          return task;
        });
      })
    }

    // Aquí en vez de poner string, como sólo aceptamos ciertos valores tenemos que concretarlos
    changeFilter(filter: 'all' | 'pending' | 'completed') {
      this.filter.set(filter);
    }

  }

