import OpenAI from "openai";

export interface ApiKeyConfig {
  key: string;
  baseUrl: string;
  model: string;
  requestsPerMinute: number;
  requestsPerDay: number;
  currentRequests: number;
  lastResetTime: number;
  totalRequests: number;
  totalTime: number;
  errors: number;
  rateLimitHits: number;
  isFreeModel: boolean;
  provider: string;
  supportsSystemPrompt: boolean;
  supportsJsonMode: boolean;
}

export interface PerformanceMetrics {
  model: string;
  keyIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  tokensUsed?: number;
}

export class RateLimitService {
  private apiKeys: ApiKeyConfig[];
  private currentKeyIndex: number = 0;
  private performanceLog: PerformanceMetrics[] = [];
  private isProcessing: boolean = false;
  private threadKeyAssignments: Map<number, number> = new Map(); // threadNumber -> keyIndex

  constructor() {
    this.apiKeys = this.initializeApiKeys();
  }

  /**
   * Get rate limits and capabilities based on model type and provider
   */
  private getModelRateLimits(model: string): {
    requestsPerMinute: number;
    isFreeModel: boolean;
    provider: string;
    supportsSystemPrompt: boolean;
    supportsJsonMode: boolean;
  } {
    const modelLower = model.toLowerCase();

    // Detect if it's a free model
    const isFreeModel = modelLower.includes(':free') || 
                       modelLower.includes('free') ||
                       modelLower.includes('gpt-oss') ||
                       modelLower.includes('gemma') ||
                       modelLower.includes('llama-3.3') ||
                       modelLower.includes('mistral-small') ||
                       modelLower.includes('deepseek-r1') ||
                       modelLower.includes('kimi-k2') ||
                       modelLower.includes('hunyuan') ||
                       modelLower.includes('devstral') ||
                       modelLower.includes('shisa') ||
                       modelLower.includes('maverick');
    
    // Detect provider
    let provider = 'unknown';
    if (modelLower.includes('openai/')) provider = 'openai';
    else if (modelLower.includes('google/')) provider = 'google';
    else if (modelLower.includes('meta-llama/')) provider = 'meta';
    else if (modelLower.includes('mistralai/')) provider = 'mistral';
    else if (modelLower.includes('deepseek/')) provider = 'deepseek';
    else if (modelLower.includes('moonshotai/')) provider = 'moonshot';
    else if (modelLower.includes('tencent/')) provider = 'tencent';
    else if (modelLower.includes('tngtech/')) provider = 'tngtech';
    else if (modelLower.includes('shisa-ai/')) provider = 'shisa';
    else if (modelLower.includes('z-ai/')) provider = 'z-ai';
    else if (modelLower.includes('openrouter/')) provider = 'openrouter';

    // Set rate limits based on model type
    let requestsPerMinute: number;
    if (isFreeModel) {
      requestsPerMinute = 2; // Very conservative for free models
    } else {
      requestsPerMinute = 30; // Higher limits for paid models
    }

    // Model-specific capabilities
    let supportsSystemPrompt = true;
    let supportsJsonMode = true;

    // Google models have restrictions
    if (provider === 'google' && modelLower.includes('gemma')) {
      supportsSystemPrompt = false; // Google Gemma doesn't support system prompts
      supportsJsonMode = false;
    }

    // Some other models might have restrictions
    if (modelLower.includes('kimi-k2') || modelLower.includes('hunyuan')) {
      supportsJsonMode = false; // Some models don't support JSON mode
    }

    return { 
      requestsPerMinute, 
      isFreeModel, 
      provider,
      supportsSystemPrompt,
      supportsJsonMode
    };
  }

  private initializeApiKeys(): ApiKeyConfig[] {
    const keys: ApiKeyConfig[] = [];

    // Primary key
    if (process.env.OPENROUTER_API_KEY) {
      const model =
        process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";
      const rateLimits = this.getModelRateLimits(model);

        keys.push({
          key: process.env.OPENROUTER_API_KEY,
          baseUrl:
            process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
          model,
          requestsPerMinute: rateLimits.requestsPerMinute,
          requestsPerDay: 10000,
          currentRequests: 0,
          lastResetTime: Date.now(),
          totalRequests: 0,
          totalTime: 0,
          errors: 0,
          rateLimitHits: 0,
          isFreeModel: rateLimits.isFreeModel,
          provider: rateLimits.provider,
          supportsSystemPrompt: rateLimits.supportsSystemPrompt,
          supportsJsonMode: rateLimits.supportsJsonMode,
        });
    }

    // Additional keys - dynamically find all available keys
    // Check for keys 1-20 to support up to 20 API keys
    for (let i = 1; i <= 16; i++) {
      const key = process.env[`OPENROUTER_API_KEY_${i}`];
      const baseUrl =
        process.env[`OPENROUTER_BASE_URL_${i}`] ||
        "https://openrouter.ai/api/v1";
      const model = process.env[`OPENROUTER_MODEL_${i}`] || "";

      if (key) {
        const rateLimits = this.getModelRateLimits(model);

        keys.push({
          key,
          baseUrl,
          model,
          requestsPerMinute: rateLimits.requestsPerMinute,
          requestsPerDay: 10000,
          currentRequests: 0,
          lastResetTime: Date.now(),
          totalRequests: 0,
          totalTime: 0,
          errors: 0,
          rateLimitHits: 0,
          isFreeModel: rateLimits.isFreeModel,
          provider: rateLimits.provider,
          supportsSystemPrompt: rateLimits.supportsSystemPrompt,
          supportsJsonMode: rateLimits.supportsJsonMode,
        });
        const capabilities = [];
        if (!rateLimits.supportsSystemPrompt) capabilities.push('no-system');
        if (!rateLimits.supportsJsonMode) capabilities.push('no-json');
        const capabilityStr = capabilities.length > 0 ? ` [${capabilities.join(', ')}]` : '';
        
        console.log(
          `🔑 Found API key ${i + 1}: ${model} (${
            rateLimits.isFreeModel ? "FREE" : "PAID"
          }, ${rateLimits.requestsPerMinute}/min)${capabilityStr}`
        );
      }
    }

    console.log(
      `🚀 Initialized ${keys.length} API keys for rate limit handling`
    );

    // Log all available keys for debugging
    keys.forEach((keyConfig, index) => {
      const capabilities = [];
      if (!keyConfig.supportsSystemPrompt) capabilities.push('no-system');
      if (!keyConfig.supportsJsonMode) capabilities.push('no-json');
      const capabilityStr = capabilities.length > 0 ? ` [${capabilities.join(', ')}]` : '';
      
      console.log(
        `   Key ${index + 1}: ${keyConfig.model} (${keyConfig.provider}, ${
          keyConfig.isFreeModel ? "FREE" : "PAID"
        }, ${keyConfig.requestsPerMinute}/min)${capabilityStr}`
      );
    });

    return keys;
  }

  private getCurrentKey(): ApiKeyConfig {
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Get the total number of available API keys
   */
  getTotalKeys(): number {
    return this.apiKeys.length;
  }

  /**
   * Calculate optimal thread count based on available rate limits
   */
  getOptimalThreadCount(): number {
    if (this.apiKeys.length === 0) return 1;

    // Calculate total requests per minute across all keys
    const totalRequestsPerMinute = this.apiKeys.reduce(
      (sum, key) => sum + key.requestsPerMinute,
      0
    );

    // For free models, be very conservative (use only 50% of available capacity)
    const freeModelKeys = this.apiKeys.filter((key) => key.isFreeModel);
    const paidModelKeys = this.apiKeys.filter((key) => !key.isFreeModel);

    let optimalThreads: number;

    if (freeModelKeys.length > 0 && paidModelKeys.length === 0) {
      // Only free models - be very conservative
      optimalThreads = Math.max(1, Math.floor(totalRequestsPerMinute * 0.3)); // Use only 30% of capacity
    } else if (freeModelKeys.length > 0 && paidModelKeys.length > 0) {
      // Mixed models - use 60% of capacity
      optimalThreads = Math.max(1, Math.floor(totalRequestsPerMinute * 0.6));
    } else {
      // Only paid models - can be more aggressive
      optimalThreads = Math.max(1, Math.floor(totalRequestsPerMinute * 0.8)); // Use 80% of capacity
    }

    // Cap at reasonable limits
    optimalThreads = Math.min(optimalThreads, 20); // Max 20 threads
    optimalThreads = Math.max(optimalThreads, 1); // Min 1 thread

    console.log(
      `🧵 Calculated optimal thread count: ${optimalThreads} (based on ${totalRequestsPerMinute} total requests/min across ${this.apiKeys.length} keys)`
    );
    console.log(
      `   Free models: ${freeModelKeys.length}, Paid models: ${paidModelKeys.length}`
    );

    return optimalThreads;
  }

  /**
   * Get all available API key configurations for debugging
   */
  getApiKeyConfigs(): ApiKeyConfig[] {
    return this.apiKeys.map((key) => ({ ...key, key: "***" })); // Hide actual keys for security
  }

  /**
   * Get key distribution statistics for a given number of threads
   */
  getKeyDistributionStats(threadCount: number): {
    totalKeys: number;
    threadsPerKey: number;
    distribution: {
      keyIndex: number;
      threadCount: number;
      percentage: number;
    }[];
    isEvenlyDistributed: boolean;
  } {
    const totalKeys = this.apiKeys.length;
    const baseThreadsPerKey = Math.floor(threadCount / totalKeys);
    const extraThreads = threadCount % totalKeys;

    const distribution = [];
    for (let i = 0; i < totalKeys; i++) {
      const threadsForThisKey = baseThreadsPerKey + (i < extraThreads ? 1 : 0);
      const percentage = (threadsForThisKey / threadCount) * 100;
      distribution.push({
        keyIndex: i,
        threadCount: threadsForThisKey,
        percentage: Math.round(percentage * 100) / 100,
      });
    }

    const threadCounts = distribution.map((d) => d.threadCount);
    const isEvenlyDistributed =
      Math.max(...threadCounts) - Math.min(...threadCounts) <= 1;

    return {
      totalKeys,
      threadsPerKey: baseThreadsPerKey,
      distribution,
      isEvenlyDistributed,
    };
  }

  /**
   * Get current rate limit status for all keys
   */
  getRateLimitStatus(): {
    keyIndex: number;
    model: string;
    currentRequests: number;
    requestsPerMinute: number;
    rateLimitHits: number;
    isAtLimit: boolean;
    timeUntilReset: number;
  }[] {
    const now = Date.now();
    return this.apiKeys.map((keyConfig, index) => {
      const timeSinceReset = now - keyConfig.lastResetTime;
      const resetInterval = 60 * 1000; // 1 minute
      const timeUntilReset = Math.max(0, resetInterval - timeSinceReset);
      const isAtLimit =
        keyConfig.currentRequests >= keyConfig.requestsPerMinute;

      return {
        keyIndex: index,
        model: keyConfig.model,
        currentRequests: keyConfig.currentRequests,
        requestsPerMinute: keyConfig.requestsPerMinute,
        rateLimitHits: keyConfig.rateLimitHits,
        isAtLimit,
        timeUntilReset: Math.ceil(timeUntilReset / 1000), // Convert to seconds
      };
    });
  }

  /**
   * Assign API keys to threads in a round-robin fashion
   * This ensures each thread gets a different key/model combination
   */
  assignKeyToThread(threadNumber: number): number {
    if (this.apiKeys.length === 0) {
      throw new Error("No API keys available");
    }

    // Use round-robin assignment based on thread number
    const keyIndex = threadNumber % this.apiKeys.length;
    this.threadKeyAssignments.set(threadNumber, keyIndex);

    const keyConfig = this.apiKeys[keyIndex];
    console.log(
      `🔑 Thread ${threadNumber} assigned to Key ${keyIndex + 1} (${
        keyConfig.model
      }) - Total keys available: ${this.apiKeys.length}`
    );

    return keyIndex;
  }

  /**
   * Get the key assigned to a specific thread
   */
  private getKeyForThread(threadNumber: number): ApiKeyConfig {
    const keyIndex = this.threadKeyAssignments.get(threadNumber);
    if (keyIndex === undefined) {
      // If thread doesn't have an assignment, assign one
      const assignedIndex = this.assignKeyToThread(threadNumber);
      return this.apiKeys[assignedIndex];
    }
    return this.apiKeys[keyIndex];
  }

  private async waitForRateLimitReset(
    keyConfig: ApiKeyConfig,
    keyIndex: number
  ): Promise<void> {
    const now = Date.now();
    const timeSinceReset = now - keyConfig.lastResetTime;
    const resetInterval = 60 * 1000; // 1 minute

    // Reset counter if enough time has passed
    if (timeSinceReset >= resetInterval) {
      keyConfig.currentRequests = 0;
      keyConfig.lastResetTime = now;
    }

    // Check if we've hit the rate limit
    if (keyConfig.currentRequests >= keyConfig.requestsPerMinute) {
      const waitTime = resetInterval - timeSinceReset;
      console.log(
        `⏳ Rate limit reached for key ${keyIndex + 1} (${
          keyConfig.model
        }). Waiting ${Math.ceil(waitTime / 1000)}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      keyConfig.currentRequests = 0;
      keyConfig.lastResetTime = Date.now();
    }
  }

  private rotateToNextKey(): void {
    const previousIndex = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

    if (this.currentKeyIndex === 0 && this.apiKeys.length > 1) {
      console.log(
        `🔄 Rotated through all ${this.apiKeys.length} API keys, back to key 1`
      );
    } else {
      console.log(
        `🔄 Switched from key ${previousIndex + 1} to key ${
          this.currentKeyIndex + 1
        }`
      );
    }
  }

  async makeRequest(
    messages: any[],
    options: any = {},
    productName: string = "Unknown",
    threadNumber?: number
  ): Promise<{ response: any; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = this.apiKeys.length * 2; // Try each key twice

    while (attempts < maxAttempts) {
      // Use thread-specific key if threadNumber is provided, otherwise use current key
      const keyConfig =
        threadNumber !== undefined
          ? this.getKeyForThread(threadNumber)
          : this.getCurrentKey();
      const keyIndex =
        threadNumber !== undefined
          ? this.threadKeyAssignments.get(threadNumber)!
          : this.currentKeyIndex;
      const threadPrefix =
        threadNumber !== undefined ? `Thread ${threadNumber} - ` : "";

      try {
        // Wait for rate limit reset if needed
        await this.waitForRateLimitReset(keyConfig, keyIndex);

        // Create OpenAI client for this key
        const openai = new OpenAI({
          apiKey: keyConfig.key,
          baseURL: keyConfig.baseUrl,
        });

        console.log(
          `🤖 ${threadPrefix}Using key ${keyIndex + 1} (${
            keyConfig.model
          }) for product: ${productName}`
        );

        // Prepare request options based on model capabilities
        const requestOptions: any = {
          model: keyConfig.model,
          ...options,
        };

        // Handle models that don't support system prompts
        if (!keyConfig.supportsSystemPrompt) {
          // Convert system message to user message for models that don't support system prompts
          const adaptedMessages = messages.map(msg => {
            if (msg.role === 'system') {
              return {
                role: 'user' as const,
                content: `System: ${msg.content}`
              };
            }
            return msg;
          });
          requestOptions.messages = adaptedMessages;
        } else {
          requestOptions.messages = messages;
        }

        // Handle models that don't support JSON mode
        if (!keyConfig.supportsJsonMode && requestOptions.response_format?.type === 'json_object') {
          // Remove JSON mode and add instruction to user message instead
          delete requestOptions.response_format;
          if (requestOptions.messages && requestOptions.messages.length > 0) {
            const lastMessage = requestOptions.messages[requestOptions.messages.length - 1];
            if (lastMessage.role === 'user') {
              lastMessage.content += '\n\nPlease respond with valid JSON only.';
            }
          }
        }

        // Make the request
        const response = await openai.chat.completions.create(requestOptions);

        // Update metrics
        const endTime = Date.now();
        const duration = endTime - startTime;

        keyConfig.currentRequests++;
        keyConfig.totalRequests++;
        keyConfig.totalTime += duration;

        const metrics: PerformanceMetrics = {
          model: keyConfig.model,
          keyIndex,
          startTime,
          endTime,
          duration,
          success: true,
          tokensUsed: response.usage?.total_tokens,
        };

        this.performanceLog.push(metrics);

        console.log(
          `✅ ${threadPrefix}Product "${productName}" processed in ${duration}ms using ${
            keyConfig.model
          } (key ${keyIndex + 1})`
        );

        return { response, metrics };
      } catch (error: any) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        keyConfig.errors++;
        keyConfig.totalTime += duration;

        const metrics: PerformanceMetrics = {
          model: keyConfig.model,
          keyIndex,
          startTime,
          endTime,
          duration,
          success: false,
          error: error.message,
        };

        this.performanceLog.push(metrics);

        // Check if it's a rate limit error
        if (error.message?.includes("rate limit") || error.status === 429) {
          keyConfig.rateLimitHits++;
          console.log(error);

          // For thread-specific requests, we don't rotate keys, just retry with the same key after delay
          if (threadNumber !== undefined) {
            // Use exponential backoff for rate limit retries
            const backoffDelay = Math.min(5000 * Math.pow(2, attempts), 60000); // Max 60 seconds
            console.log(
              `⏳ Thread ${threadNumber} waiting ${
                backoffDelay / 1000
              }s for rate limit reset...`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));

            // Reset the key's request counter to allow retry
            keyConfig.currentRequests = 0;
            keyConfig.lastResetTime = Date.now();

            attempts++;
            continue;
          } else {
            // For non-thread requests, rotate to next key
            this.rotateToNextKey();
            attempts++;
            continue;
          }
        }

        // For other errors, also try next key
        console.log(error);

        if (threadNumber !== undefined) {
          // For thread-specific requests, retry with same key
          attempts++;
          continue;
        } else {
          // For non-thread requests, rotate to next key
          this.rotateToNextKey();
          attempts++;
        }
      }
    }

    throw new Error(
      `All ${this.apiKeys.length} API keys failed after ${attempts} attempts`
    );
  }

  getPerformanceReport(): {
    summary: any;
    byModel: any;
    byKey: any;
    byThread: any;
    timeline: PerformanceMetrics[];
  } {
    const totalRequests = this.performanceLog.length;
    const successfulRequests = this.performanceLog.filter(
      (m) => m.success
    ).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalTime = this.performanceLog.reduce(
      (sum, m) => sum + m.duration,
      0
    );
    const averageTime = totalRequests > 0 ? totalTime / totalRequests : 0;

    // Group by model
    const byModel: any = {};
    this.performanceLog.forEach((metric) => {
      if (!byModel[metric.model]) {
        byModel[metric.model] = {
          requests: 0,
          successful: 0,
          failed: 0,
          totalTime: 0,
          averageTime: 0,
          rateLimitHits: 0,
        };
      }
      byModel[metric.model].requests++;
      byModel[metric.model].totalTime += metric.duration;
      if (metric.success) {
        byModel[metric.model].successful++;
      } else {
        byModel[metric.model].failed++;
      }
    });

    // Calculate averages
    Object.keys(byModel).forEach((model) => {
      const data = byModel[model];
      data.averageTime = data.requests > 0 ? data.totalTime / data.requests : 0;
    });

    // Group by thread (extract thread info from metrics)
    const byThread: any = {};
    this.performanceLog.forEach((metric) => {
      // Extract thread number from the metrics (we'll need to add this to PerformanceMetrics)
      const threadKey = `Thread ${metric.keyIndex + 1}`; // Using keyIndex as proxy for thread
      if (!byThread[threadKey]) {
        byThread[threadKey] = {
          requests: 0,
          successful: 0,
          failed: 0,
          totalTime: 0,
          averageTime: 0,
          model: metric.model,
        };
      }
      byThread[threadKey].requests++;
      byThread[threadKey].totalTime += metric.duration;
      if (metric.success) {
        byThread[threadKey].successful++;
      } else {
        byThread[threadKey].failed++;
      }
    });

    // Calculate thread averages
    Object.keys(byThread).forEach((thread) => {
      const data = byThread[thread];
      data.averageTime = data.requests > 0 ? data.totalTime / data.requests : 0;
    });

    // Group by key
    const byKey: any = {};
    this.apiKeys.forEach((keyConfig, index) => {
      byKey[`Key ${index + 1}`] = {
        model: keyConfig.model,
        totalRequests: keyConfig.totalRequests,
        totalTime: keyConfig.totalTime,
        averageTime:
          keyConfig.totalRequests > 0
            ? keyConfig.totalTime / keyConfig.totalRequests
            : 0,
        errors: keyConfig.errors,
        rateLimitHits: keyConfig.rateLimitHits,
        successRate:
          keyConfig.totalRequests > 0
            ? (
                ((keyConfig.totalRequests - keyConfig.errors) /
                  keyConfig.totalRequests) *
                100
              ).toFixed(2) + "%"
            : "0%",
      };
    });

    return {
      summary: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate:
          totalRequests > 0
            ? ((successfulRequests / totalRequests) * 100).toFixed(2) + "%"
            : "0%",
        totalTime: totalTime,
        averageTime: Math.round(averageTime),
        totalKeys: this.apiKeys.length,
      },
      byModel,
      byKey,
      byThread,
      timeline: this.performanceLog,
    };
  }

  printPerformanceReport(): void {
    const report = this.getPerformanceReport();

    console.log("\n📊 ===== PERFORMANCE REPORT =====");
    console.log(`📈 Summary:`);
    console.log(`   Total Requests: ${report.summary.totalRequests}`);
    console.log(`   Successful: ${report.summary.successfulRequests}`);
    console.log(`   Failed: ${report.summary.failedRequests}`);
    console.log(`   Success Rate: ${report.summary.successRate}`);
    console.log(`   Total Time: ${report.summary.totalTime}ms`);
    console.log(`   Average Time: ${report.summary.averageTime}ms`);
    console.log(`   API Keys Used: ${report.summary.totalKeys}`);

    console.log(`\n🤖 Performance by Model:`);
    Object.entries(report.byModel).forEach(([model, data]: [string, any]) => {
      console.log(`   ${model}:`);
      console.log(`     Requests: ${data.requests}`);
      console.log(
        `     Success Rate: ${
          data.requests > 0
            ? ((data.successful / data.requests) * 100).toFixed(2) + "%"
            : "0%"
        }`
      );
      console.log(`     Average Time: ${Math.round(data.averageTime)}ms`);
    });

    console.log(`\n🔑 Performance by API Key:`);
    Object.entries(report.byKey).forEach(([keyName, data]: [string, any]) => {
      console.log(`   ${keyName} (${data.model}):`);
      console.log(`     Requests: ${data.totalRequests}`);
      console.log(`     Success Rate: ${data.successRate}`);
      console.log(`     Average Time: ${Math.round(data.averageTime)}ms`);
      console.log(`     Rate Limit Hits: ${data.rateLimitHits}`);
    });

    console.log(`\n🧵 Performance by Thread:`);
    Object.entries(report.byThread).forEach(
      ([threadName, data]: [string, any]) => {
        console.log(`   ${threadName} (${data.model}):`);
        console.log(`     Requests: ${data.requests}`);
        console.log(
          `     Success Rate: ${
            data.requests > 0
              ? ((data.successful / data.requests) * 100).toFixed(2) + "%"
              : "0%"
          }`
        );
        console.log(`     Average Time: ${Math.round(data.averageTime)}ms`);
      }
    );

    // Find fastest model
    const fastestModel = Object.entries(report.byModel).reduce(
      (fastest, [model, data]: [string, any]) => {
        return data.averageTime < fastest.averageTime
          ? { model, ...data }
          : fastest;
      },
      { model: "", averageTime: Infinity }
    );

    if (fastestModel.model) {
      console.log(
        `\n🏆 Fastest Model: ${fastestModel.model} (${Math.round(
          fastestModel.averageTime
        )}ms average)`
      );
    }

    console.log("📊 ================================\n");
  }

  /**
   * Print current rate limit status for all keys
   */
  printRateLimitStatus(): void {
    const status = this.getRateLimitStatus();

    console.log("\n🚦 ===== RATE LIMIT STATUS =====");
    status.forEach((keyStatus) => {
      const keyConfig = this.apiKeys[keyStatus.keyIndex];
      const statusIcon = keyStatus.isAtLimit ? "🚫" : "✅";
      const resetInfo = keyStatus.isAtLimit
        ? ` (resets in ${keyStatus.timeUntilReset}s)`
        : "";
      const modelType = keyConfig.isFreeModel ? "FREE" : "PAID";
      console.log(
        `${statusIcon} Key ${keyStatus.keyIndex + 1} (${
          keyStatus.model
        } [${modelType}]): ${keyStatus.currentRequests}/${
          keyStatus.requestsPerMinute
        } requests${resetInfo}`
      );
    });
    console.log("🚦 ==============================\n");
  }
}
