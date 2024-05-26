import config from "config";
import localTaskParser, { parseTaskInput } from "services/ai/localTaskParser";
import remoteTaskParser from "services/ai/remoteTaskParser";

/**
 * Registry of natural-language task parsers.
 *
 * A provider is `{ name, isAvailable(), parse(input, options) }`. Adding one is
 * a matter of registering it here — nothing in the UI names a provider.
 */
const providers = new Map([
  [localTaskParser.name, localTaskParser],
  [remoteTaskParser.name, remoteTaskParser],
]);

export const registerTaskParser = (provider) => {
  providers.set(provider.name, provider);
  return () => providers.delete(provider.name);
};

export const availableParsers = () =>
  [...providers.values()].filter((provider) => provider.isAvailable());

export const LOCAL_PARSER_NAME = localTaskParser.name;

/**
 * Parse with the named provider, falling back to the local parser whenever that
 * provider is unknown, unavailable, or throws. The caller always gets a usable
 * draft: there is no failure path that leaves the form empty.
 */
export const parseWithProvider = async (name, input, options = {}) => {
  const provider = providers.get(name);

  if (provider && provider.name !== LOCAL_PARSER_NAME && provider.isAvailable()) {
    try {
      return await provider.parse(input, options);
    } catch (error) {
      console.warn(`[ai] provider "${name}" failed, using local parser`, error);
    }
  }

  return localTaskParser.parse(input, options);
};

export const parseTask = (input, options = {}) =>
  parseWithProvider(config.ai.provider, input, options);

export { parseTaskInput, localTaskParser, remoteTaskParser };
