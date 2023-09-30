const processLinesFromStream = (rawData: string, onData) => {
  const lines = rawData.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const dataStr = line.substring(6);
      // @TODO: at the moment it's OpenAI specific. Make it generic.
      if (dataStr === "[DONE]") {
        onData({ finished: true });
        return;
      }

      try {
        const data = JSON.parse(dataStr);
        onData(data);
      } catch (err) {
        throw new Error(err);
      }
    }
  }
};

export default processLinesFromStream;
