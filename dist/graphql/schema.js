"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
exports.schema = (0, graphql_1.buildSchema)(`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    priority: String!
    assignedTo: User
    project: Project
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    owner: User!
    tasks: [Task!]!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    tasks: [Task!]!
    task(id: ID!): Task
    projects: [Project!]!
    project(id: ID!): Project
    tasksByProject(projectId: ID!): [Task!]!
    tasksByUser(userId: ID!): [Task!]!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
  }

  input CreateTaskInput {
    title: String!
    description: String
    status: String!
    priority: String!
    assignedToId: ID
    projectId: ID!
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: String
    priority: String
    assignedToId: ID
  }

  input CreateProjectInput {
    name: String!
    description: String
    status: String!
  }

  input UpdateProjectInput {
    name: String
    description: String
    status: String
  }
`);
//# sourceMappingURL=schema.js.map