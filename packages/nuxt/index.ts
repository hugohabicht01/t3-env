import type { ZodType } from "zod";
import {
  createEnv as createEnvCore,
  ServerClientOptions,
  StrictOptions,
} from "../core";

const CLIENT_PREFIX = "NUXT_PUBLIC_" as const;
type ClientPrefix = typeof CLIENT_PREFIX;

type Options<
  TServer extends Record<string, ZodType>,
  TClient extends Record<`${ClientPrefix}${string}`, ZodType>
> = Omit<
  StrictOptions<ClientPrefix, TServer, TClient> &
    ServerClientOptions<ClientPrefix, TServer, TClient>,
  "runtimeEnvStrict" | "runtimeEnv" | "clientPrefix"
>;

export function createEnv<
  TServer extends Record<string, ZodType> = NonNullable<unknown>,
  TClient extends Record<string, ZodType> = NonNullable<unknown>
>(opts: Options<TServer, TClient>) {
  const client =
    typeof opts.client === "object"
      ? opts.client
      : ({} as {
          [TKey in keyof TClient]: TKey extends `NUXT_PUBLIC_${string}`
            ? TClient[TKey]
            : `${TKey extends string
                ? TKey
                : never} is not prefixed with NUXT_PUBLIC_.`;
        });
  const server =
    typeof opts.server === "object"
      ? opts.server
      : ({} as {
          [TKey in keyof TServer]: TKey extends `NUXT_PUBLIC_${string}`
            ? `${TKey extends `NUXT_PUBLIC_${string}`
                ? TKey
                : never} should not prefixed with NUXT_PUBLIC_.`
            : TServer[TKey];
        });

  return createEnvCore<ClientPrefix, TServer, TClient>({
    ...opts,
    client,
    server,
    clientPrefix: CLIENT_PREFIX,
    runtimeEnv: process.env,
  });
}
