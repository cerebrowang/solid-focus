import { FieldType, MultiModelRelation, SingleModelRelation, Attributes } from 'soukai';
import { SolidModel } from 'soukai-solid';

import Task from '@/models/soukai/Task';
import Workspace from '@/models/soukai/Workspace';

export default class List extends SolidModel {

    public static ldpContainer = true;

    public static rdfContexts = {
        'lifecycle': 'http://purl.org/vocab/lifecycle/schema#',
    };

    public static rdfsClasses = ['lifecycle:TaskGroup'];

    public static fields = {
        name: {
            type: FieldType.String,
            rdfProperty: 'rdfs:label',
            required: true,
        },
        taskUrls: {
            type: FieldType.Array,
            rdfProperty: 'lifecycle:task',
            items: { type: FieldType.Key },
        },
    };

    public name!: string;

    public workspace!: Workspace;

    public tasks?: Task[];

    public editable: boolean = true;

    public get empty(): boolean {
        return this.isRelationLoaded('tasks') ? this.tasks!.length === 0 : true;
    }

    public get length(): number {
        return this.isRelationLoaded('tasks') ? this.tasks!.length : 0;
    }

    public workspaceRelationship(): SingleModelRelation {
        return this.isContainedBy(Workspace);
    }

    public tasksRelationship(): MultiModelRelation {
        return this.hasMany(Task, 'taskUrls');
    }

    public async createTask(attributes: Attributes): Promise<Task> {
        // TODO implement this.tasksRelationship().create(attributes); in soukai

        const task = new Task(attributes);

        if (this.isRelationLoaded('tasks')) {
            this.setRelationModels('tasks', [...this.tasks || [], task]);
        }

        await task.save(this.url);
        await this.update({ taskUrls: [...this.taskUrls, task.url] });

        return task;
    }

}
