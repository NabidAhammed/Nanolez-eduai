<?php
// AI Service for EduAI-NanoLez

require_once 'config.php';

class AIService {
    
    public static function callAIModel($prompt, $systemPrompt = '', $jsonMode = false, $useSearch = false, $maxRetries = 3) {
        $delays = RETRY_DELAYS;
        
        // Try each model in sequence
        $models = [
            ['provider' => 'gemini', 'model' => 'gemini', 'retry' => 0],
            ['provider' => 'groq', 'model' => 'groq_llama_70b', 'retry' => 0],
            ['provider' => 'groq', 'model' => 'groq_llama_8b', 'retry' => 0],
            ['provider' => 'groq', 'model' => 'groq_mixtral', 'retry' => 0],
            ['provider' => 'mistral', 'model' => 'mistral', 'retry' => 0]
        ];

        foreach ($models as $modelConfig) {
            for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
                try {
                    $response = '';
                    
                    switch ($modelConfig['provider']) {
                        case 'gemini':
                            $response = self::callGeminiAPI($prompt, $systemPrompt, $jsonMode, $useSearch);
                            break;
                        case 'groq':
                            $response = self::callGroqAPI($modelConfig['model'], $prompt, $systemPrompt, $jsonMode);
                            break;
                        case 'mistral':
                            $response = self::callMistralAPI($prompt, $systemPrompt, $jsonMode);
                            break;
                    }

                    if (!empty($response) && trim($response) !== '') {
                        return $response;
                    }

                    throw new Exception('Empty response from AI model');

                } catch (Exception $e) {
                    error_log("Model {$modelConfig['model']} attempt " . ($attempt + 1) . " failed: " . $e->getMessage());
                    
                    if ($attempt < $maxRetries - 1) {
                        usleep($delays[$attempt] * 1000); // Convert to microseconds
                    } else {
                        break; // Try next model
                    }
                }
            }
        }

        throw new Exception('All AI models failed to respond. Please check your API keys and try again.');
    }

    public static function callGeminiAPI($prompt, $systemPrompt = '', $jsonMode = false, $useSearch = false) {
        if (empty(GEMINI_API_KEY)) {
            throw new Exception('Gemini API key not configured');
        }
        
        $payload = [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'responseMimeType' => $jsonMode ? 'application/json' : 'text/plain',
                'temperature' => 0.7
            ]
        ];

        if (!empty($systemPrompt)) {
            $payload['systemInstruction'] = ['parts' => [['text' => $systemPrompt]]];
        }

        if ($useSearch) {
            $payload['tools'] = [['google_search' => []]];
        }

        $headers = ['Content-Type: application/json'];
        
        return self::callAPI('gemini', $payload, $headers);
    }

    public static function callGroqAPI($model, $prompt, $systemPrompt = '', $jsonMode = false) {
        if (empty(GROQ_API_KEY)) {
            throw new Exception('Groq API key not configured');
        }
        
        $payload = [
            'model' => self::getGroqModelName($model),
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => $jsonMode ? 4000 : 2000
        ];

        if ($jsonMode) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . GROQ_API_KEY
        ];
        
        return self::callAPI($model, $payload, $headers);
    }

    public static function callMistralAPI($prompt, $systemPrompt = '', $jsonMode = false) {
        if (empty(MISTRAL_API_KEY)) {
            throw new Exception('Mistral API key not configured');
        }
        
        $payload = [
            'model' => 'mistral-large-latest',
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
            'max_tokens' => $jsonMode ? 4000 : 2000
        ];

        if ($jsonMode) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . MISTRAL_API_KEY
        ];
        
        return self::callAPI('mistral', $payload, $headers);
    }

    private static function getGroqModelName($model) {
        switch ($model) {
            case 'groq_llama_70b':
                return 'llama-3.1-70b-versatile';
            case 'groq_llama_8b':
                return 'llama-3.1-8b-instant';
            case 'groq_mixtral':
                return 'mixtral-8x7b-32768';
            default:
                return 'llama-3.1-8b-instant';
        }
    }

    private static function callAPI($provider, $payload, $headers) {
        try {
            $endpoint = '';
            
            switch ($provider) {
                case 'gemini':
                    $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=' . GEMINI_API_KEY;
                    break;
                case 'groq_llama_70b':
                case 'groq_llama_8b':
                case 'groq_mixtral':
                    $endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                    break;
                case 'mistral':
                    $endpoint = 'https://api.mistral.ai/v1/chat/completions';
                    break;
                default:
                    throw new Exception('Unknown provider: ' . $provider);
            }

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $endpoint,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_TIMEOUT => 60,
                CURLOPT_CONNECTTIMEOUT => 30
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                throw new Exception("cURL Error: " . $error);
            }

            if ($httpCode !== 200) {
                throw new Exception("HTTP Error: " . $httpCode);
            }

            $data = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("JSON Parse Error: " . json_last_error_msg());
            }

            // Extract text based on provider
            switch ($provider) {
                case 'gemini':
                    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    break;
                case 'groq_llama_70b':
                case 'groq_llama_8b':
                case 'groq_mixtral':
                    $text = $data['choices'][0]['message']['content'] ?? '';
                    break;
                case 'mistral':
                    $text = $data['choices'][0]['message']['content'] ?? '';
                    break;
                default:
                    $text = '';
            }

            return $text;

        } catch (Exception $e) {
            error_log("API Call Error: " . $e->getMessage());
            throw $e;
        }
    }
}

function callAIModel($prompt, $systemPrompt = '', $jsonMode = false, $useSearch = false) {
    return AIService::callAIModel($prompt, $systemPrompt, $jsonMode, $useSearch);
}

// Resource validation functions
function validateUrl($url) {
    $result = [
        'valid' => false,
        'confidence' => 0,
        'issues' => [],
        'isSecure' => false,
        'isEducational' => false
    ];

    if (empty($url)) {
        $result['issues'][] = 'Empty URL';
        return $result;
    }

    // Check HTTPS requirement
    if (strpos($url, 'https://') === 0) {
        $result['isSecure'] = true;
    } else {
        $result['issues'][] = 'Not using HTTPS';
    }

    // Parse URL
    $parsed = @parse_url($url);
    if (!$parsed || !isset($parsed['host'])) {
        $result['issues'][] = 'Invalid URL format';
        return $result;
    }

    $domain = strtolower($parsed['host']);
    $domain = preg_replace('/^www\./', '', $domain); // Remove www prefix

    // Check against known good domains
    if (in_array($domain, KNOWN_GOOD_DOMAINS)) {
        $result['valid'] = true;
        $result['confidence'] = 90;
        $result['isEducational'] = true;
    } else {
        // Check if domain contains educational keywords
        $educationalKeywords = ['edu', 'learn', 'tutorial', 'docs', 'guide', 'academy'];
        foreach ($educationalKeywords as $keyword) {
            if (strpos($domain, $keyword) !== false) {
                $result['confidence'] = 70;
                $result['isEducational'] = true;
                break;
            }
        }

        // Check if it's a well-known platform
        $knownPlatforms = ['github.com', 'stackoverflow.com', 'youtube.com'];
        if (in_array($domain, $knownPlatforms)) {
            $result['confidence'] = 60;
        }

        if ($result['confidence'] < 50) {
            $result['issues'][] = 'Unknown or low-quality domain';
        }
    }

    return $result;
}

function getFallbackResource($topic, $type = 'article') {
    $topic = strtolower($topic);
    
    // Programming topics
    $programmingKeywords = ['javascript', 'python', 'php', 'html', 'css', 'react', 'vue', 'angular', 'node.js', 'express', 'laravel'];
    $isProgramming = false;
    foreach ($programmingKeywords as $keyword) {
        if (strpos($topic, $keyword) !== false) {
            $isProgramming = true;
            break;
        }
    }

    // Data science keywords
    $dataScienceKeywords = ['pandas', 'numpy', 'matplotlib', 'scikit', 'machine learning', 'data analysis', 'statistics'];
    $isDataScience = false;
    foreach ($dataScienceKeywords as $keyword) {
        if (strpos($topic, $keyword) !== false) {
            $isDataScience = true;
            break;
        }
    }

    if ($type === 'video') {
        $language = 'en'; // Default to English
        if (strpos($topic, 'hindi') !== false || strpos($topic, 'हिंदी') !== false) {
            $language = 'hi';
        } elseif (strpos($topic, 'urdu') !== false || strpos($topic, 'اردو') !== false) {
            $language = 'ur';
        }

        $searchQuery = LANGUAGE_SEARCH_QUERIES[$language] ?? LANGUAGE_SEARCH_QUERIES['en'];
        $searchUrl = 'https://www.youtube.com/results?search_query=' . urlencode($topic . ' ' . $searchQuery);

        return [
            'title' => $topic . ' - Video Tutorial Search',
            'url' => $searchUrl,
            'type' => 'search',
            'status' => 'valid',
            'platform' => 'YouTube',
            'confidence' => 'high'
        ];
    } else {
        // Article resources
        if ($isProgramming) {
            $platforms = VERIFIED_EDUCATIONAL_PLATFORMS['programming'];
        } elseif ($isDataScience) {
            $platforms = VERIFIED_EDUCATIONAL_PLATFORMS['dataScience'];
        } else {
            $platforms = VERIFIED_EDUCATIONAL_PLATFORMS['general'];
        }
        
        $selectedPlatform = $platforms[0]; // Use first platform as default
        
        return [
            'title' => $topic . ' - Comprehensive Guide',
            'url' => $selectedPlatform,
            'type' => 'verified',
            'status' => 'valid',
            'platform' => 'Verified Educational Platform',
            'confidence' => 'high'
        ];
    }
}

function enhanceResourcePrompt($prompt, $topic, $language, $isFirstArticle = false) {
    $enhancedPrompt = "Generate educational resources for: " . $prompt . "\n\n";
    $enhancedPrompt .= "IMPORTANT REQUIREMENTS:\n";
    $enhancedPrompt .= "1. ONLY use HTTPS URLs (http:// links are NOT allowed)\n";
    $enhancedPrompt .= "2. Prioritize official documentation and well-known educational platforms\n";
    $enhancedPrompt .= "3. For articles: First resource should be direct link to article, others should be search URLs\n";
    $enhancedPrompt .= "4. For videos: First resource should be direct link to renowned channel, others should be search URLs\n";
    $enhancedPrompt .= "5. Ensure all URLs are working and accessible\n\n";
    
    // Detect topic type for specific recommendations
    $topicLower = strtolower($topic);
    
    if (strpos($topicLower, 'javascript') !== false || strpos($topicLower, 'react') !== false || strpos($topicLower, 'html') !== false || strpos($topicLower, 'css') !== false) {
        $enhancedPrompt .= "RECOMMENDED PLATFORMS FOR WEB DEVELOPMENT:\n";
        $enhancedPrompt .= "- Primary: developer.mozilla.org, javascript.info, web.dev\n";
        $enhancedPrompt .= "- Secondary: freecodecamp.org, css-tricks.com, codecademy.com\n\n";
    } elseif (strpos($topicLower, 'python') !== false || strpos($topicLower, 'pandas') !== false || strpos($topicLower, 'data') !== false) {
        $enhancedPrompt .= "RECOMMENDED PLATFORMS FOR DATA SCIENCE:\n";
        $enhancedPrompt .= "- Primary: pandas.pydata.org, numpy.org, python.org\n";
        $enhancedPrompt .= "- Secondary: kaggle.com/learn, datacamp.com, coursera.org\n\n";
    } elseif (strpos($topicLower, 'php') !== false) {
        $enhancedPrompt .= "RECOMMENDED PLATFORMS FOR PHP:\n";
        $enhancedPrompt .= "- Primary: php.net, laravel.com\n";
        $enhancedPrompt .= "- Secondary: freecodecamp.org, w3schools.com\n\n";
    }
    
    $enhancedPrompt .= "RESPONSE FORMAT:\n";
    $enhancedPrompt .= "Return a JSON array of resources with title and url fields.\n";
    $enhancedPrompt .= "Each resource should be high-quality and educational.\n";
    
    return $enhancedPrompt;
}

function validateAndEnhanceResources($resources, $topic, $language, $isFirstArticle = false) {
    $enhanced = [];
    
    // Process article resource
    if (isset($resources['article']) && isset($resources['article']['url'])) {
        try {
            $validatedArticle = validateUrl($resources['article']['url']);
            if ($validatedArticle['valid'] && $validatedArticle['confidence'] >= 50) {
                $enhanced['article'] = array_merge($resources['article'], $validatedArticle);
            } else {
                $enhanced['article'] = getFallbackResource($topic, 'article');
            }
        } catch (Exception $e) {
            $enhanced['article'] = getFallbackResource($topic, 'article');
        }
    } else {
        $enhanced['article'] = getFallbackResource($topic, 'article');
    }
    
    // Process video resource
    if (isset($resources['video']) && isset($resources['video']['url'])) {
        try {
            $validatedVideo = validateUrl($resources['video']['url']);
            if ($validatedVideo['valid']) {
                // If this is NOT the first article and we got a direct video link, convert it to search
                if (!$isFirstArticle && (strpos($validatedVideo['url'], 'watch?v=') !== false || strpos($validatedVideo['url'], 'youtu.be') !== false)) {
                    $enhanced['video'] = getFallbackResource($topic, 'video');
                } else {
                    $enhanced['video'] = array_merge($resources['video'], $validatedVideo);
                }
            } else {
                $enhanced['video'] = getFallbackResource($topic, 'video');
            }
        } catch (Exception $e) {
            $enhanced['video'] = getFallbackResource($topic, 'video');
        }
    } else {
        $enhanced['video'] = getFallbackResource($topic, 'video');
    }
    
    return $enhanced;
}
?>
