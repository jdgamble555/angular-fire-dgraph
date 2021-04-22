import { gql } from "@urql/core";

export const GET_TASKS = gql`
  query GET_TASKS {
    queryTask {
      id
      title
      completed
      user {
        email
      }
    }
  }
`;

export const SUB_GET_TASKS = gql`
  subscription GET_TASKS {
    queryTask {
      id
      title
      completed
      user {
        email
      }
    }
  }
`;

export const ADD_TASK = gql`
  mutation addTask($task: [AddTaskInput!]!) {
    addTask(input: $task) {
      task {
        id
        title
        completed
        user {
          email
        }
      }
    }
  }
`;

export const DEL_TASK = gql`
  mutation deleteTask($id: [ID!]) {
    deleteTask(filter: { id: $id }) {
      msg
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask($id: ID!, $completed: Boolean!) {
    updateTask(
      input: { filter: { id: [$id] }, set: { completed: $completed } }
    ) {
      task {
        id
        title
        completed
      }
    }
  }
`;
