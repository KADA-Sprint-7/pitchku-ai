class AIProvider {
  async generate(options) {
    throw new Error(
      "AIProvider.generate() must be implemented"
    );
  }
}

module.exports = AIProvider;