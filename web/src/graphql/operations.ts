import { gql } from "@apollo/client";

export const GET_USER_PETS = gql`
  query GetUserPets($userId: ID!) {
    getUserPets(userId: $userId) {
      id
      name
      level
      xp
      currentMood
      colorTheme
    }
  }
`;

export const GET_LOGS = gql`
  query GetLogs($userId: ID!) {
    getLogs(userId: $userId) {
      id
      entryText
      sentimentScore
      createdAt
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!) {
    createUser(username: $username, email: $email) {
      id
      username
      email
    }
  }
`;

export const CREATE_PET = gql`
  mutation CreatePet($userId: ID!, $name: String!) {
    createPet(userId: $userId, name: $name) {
      id
      name
      level
      xp
      currentMood
      colorTheme
    }
  }
`;

export const ADD_LOG_ENTRY = gql`
  mutation AddLogEntry($userId: ID!, $entryText: String!) {
    addLogEntry(userId: $userId, entryText: $entryText) {
      id
      name
      level
      xp
      currentMood
      colorTheme
    }
  }
`;
