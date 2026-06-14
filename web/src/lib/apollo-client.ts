import { ApolloClient, from, HttpLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      console.error("[GraphQL error]", message);
    });
  }
  if (networkError) {
    console.error("[Network error]", networkError.message);
  }
});

// GraphQL adresini çalışma anında çöz: env varsa onu kullan; tarayıcıda sayfanın
// yüklendiği host'tan türet (telefon/hotspot IP'si ne olursa olsun çalışır); SSR'de localhost.
function resolveGraphqlUri(): string {
  if (process.env.NEXT_PUBLIC_GRAPHQL_URL) {
    return process.env.NEXT_PUBLIC_GRAPHQL_URL;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000/graphql`;
  }
  return "http://localhost:8000/graphql";
}

const httpLink = new HttpLink({
  uri: resolveGraphqlUri(),
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});
