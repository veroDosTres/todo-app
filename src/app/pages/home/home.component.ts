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

  tasks = signal<Task[]>([]);

  filter = signal<'all' | 'pending' | 'completed'>('all');
  
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

  injector = inject(Injector);

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
        try {
            const tasks = JSON.parse(storage); 
            this.tasks.set(tasks); 
        } catch (error) {
            console.error('Error al parsear tareas del localStorage:', error);
            
            localStorage.removeItem('tasks');
        }
    } 
    this.trackTasks();
  }

  trackTasks() {
    effect(() => {
      const tasks = this.tasks(); 
      console.log('Tareas actuales:', tasks);
      try {
          localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
          console.error('Error al guardar tareas en localStorage:', error);
      }
  }, { injector: this.injector });
  }

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

    changeFilter(filter: 'all' | 'pending' | 'completed') {
      this.filter.set(filter);
    }

  }

