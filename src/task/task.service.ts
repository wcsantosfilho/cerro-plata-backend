import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindAllParameters, TaskDto } from './task.dto';

@Injectable()
export class TaskService {
  private tasks: TaskDto[] = [];

  create(task: TaskDto) {
    this.tasks.push(task);
    console.log(this.tasks);
  }

  findById(id: string): TaskDto {
    const foundTask = this.tasks.filter((el) => el.id === id);

    if (foundTask.length) {
      return foundTask[0];
    }

    throw new HttpException(
      `Task with id: ${id} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  findAll(params: FindAllParameters): TaskDto[] {
    return this.tasks.filter((el) => {
      let match = true;
      if (params.title != undefined && !el.title.includes(params.title)) {
        match = false;
      }

      if (params.status != undefined && el.status !== params.status) {
        match = false;
      }
      return match;
    });
  }

  update(task: TaskDto): TaskDto {
    const foundTaskIndex = this.tasks.findIndex((el) => el.id === task.id);
    if (foundTaskIndex != -1) {
      this.tasks[foundTaskIndex] = task;
      return task;
    }

    throw new HttpException(
      `Task with id: ${task.id} not found`,
      HttpStatus.BAD_REQUEST,
    );
  }

  remove(id: string): TaskDto[] {
    const foundTaskIndex = this.tasks.findIndex((el) => el.id === id);
    if (foundTaskIndex != -1) {
      return this.tasks.splice(foundTaskIndex, 1);
    }

    throw new HttpException(
      `Task with id: ${id} not found`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
