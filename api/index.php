<?php
// Main API endpoint for EduAI-NanoLez
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include configuration
require_once 'config.php';
require_once 'ai_service.php';

// Main API router
try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate input
    if (!isset($data['action'])) {
        throw new Exception('Missing required field: action');
    }
    
    $action = $data['action'];
    
    switch ($action) {
        case 'generate_roadmap':
            handleGenerateRoadmap($data);
            break;
            
        case 'fetch_article':
            handleFetchArticle($data);
            break;
            
        case 'validate_url':
            handleValidateUrl($data);
            break;
            
        default:
            throw new Exception('Unknown action: ' . $action);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}

function handleGenerateRoadmap($data) {
    // Validate required fields
    if (!isset($data['goal']) || !isset($data['intensity']) || !isset($data['duration']) || !isset($data['studyTime']) || !isset($data['language'])) {
        throw new Exception('Missing required fields for roadmap generation');
    }
    
    $goal = $data['goal'];
    $intensity = $data['intensity'];
    $duration = $data['duration'];
    $studyTime = $data['studyTime'];
    $language = $data['language'];
    
    $systemPrompt = "You are a Pedagogical Architect and a academician researcher. Create concise, hierarchical learning paths including every month, every week, and 7 days. OUTPUT JSON ONLY.";
    $prompt = "Generate a learning path for: \"$goal\". Level: $intensity. Duration: $duration month(s). Study: $studyTime h/day. Language: $language. 
    JSON Schema: { \"title\": \"string\", \"months\": [{ \"name\": \"string\", \"weeks\": [{ \"name\": \"string\", \"goal\": \"string\", \"days\": [{ \"day\": number, \"topic\": \"string\", \"task\": \"string\" }] }] }] }";
    
    try {
        $result = callAIModel($prompt, $systemPrompt, true, false);
        $data = json_decode($result, true);
        
        if (!$data || !isset($data['title'])) {
            throw new Exception('Invalid response from AI model');
        }
        
        $roadmap = [
            'id' => uniqid('roadmap_'),
            'title' => $data['title'],
            'months' => $data['months'] ?? [],
            'completedDays' => [],
            'lang' => $language,
            'intensity' => $intensity,
            'meta' => [
                'goal' => $goal,
                'duration' => $duration,
                'studyTime' => $studyTime
            ],
            'created_at' => date('c')
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $roadmap
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Roadmap generation failed: ' . $e->getMessage());
    }
}

function handleFetchArticle($data) {
    // Validate required fields
    if (!isset($data['topic']) || !isset($data['task']) || !isset($data['language']) || !isset($data['roadmapId'])) {
        throw new Exception('Missing required fields for article fetching');
    }
    
    $topic = $data['topic'];
    $task = $data['task'];
    $language = $data['language'];
    $roadmapId = $data['roadmapId'];
    $isFirstArticle = $data['isFirstArticle'] ?? false;
    
    $systemPrompt = "You are an Expert Knowledge Miner. Your goal is to provide the most high-value direct resources available.
    
    CRITICAL YOUTUBE LOGIC:
    1. Search for high-value, specific video tutorials (watch for channels like freeCodeCamp, MIT, Fireship, or industry leaders).
    2. If you find a direct, high-quality video URL, use it in the JSON.
    3. If NO high-value direct video is available, provide a pre-formatted search query URL.
    
    MANDATORY JSON FORMAT: {
      \"title\": \"string\",
      \"subtitle\": \"string\",
      \"deepDive\": \"3 paragraph explanation\",
      \"technicalConcepts\": [{\"term\": \"name\", \"explanation\": \"desc\"}],
      \"steps\": [\"step 1\", \"step 2\"],
      \"practiceLab\": \"code or task\",
      \"resources\": { 
        \"article\": {\"title\": \"Full Guide\", \"url\": \"string\"}, 
        \"video\": {\"title\": \"Tutorial/Search\", \"url\": \"string\"} 
      }
    }";
    
    $prompt = "Research and explain: \"$topic\". context: $task. Language: $language. 
    RESOURCES TASK: 
    - Find a direct, high-value YouTube video URL if this is the first article.
    - If no specific high-value video is found OR this is not the first article, set resources.video.url to: https://www.youtube.com/results?search_query=[topic_in_$language]
    - Find a high-value article/doc URL. If not found, use a search link.";
    
    // Enhanced prompt with validation requirements
    $enhancedPrompt = enhanceResourcePrompt($prompt, $topic, $language, $isFirstArticle);
    
    try {
        $result = callAIModel($enhancedPrompt, $systemPrompt, true, true);
        
        if (!$result) {
            throw new Exception("No data received");
        }
        
        $data = json_decode($result, true);
        
        if (!$data) {
            throw new Exception("Invalid JSON response from AI");
        }
        
        // Validate and enhance resources with fallback
        $validatedResources = validateAndEnhanceResources($data['resources'] ?? [], $topic, $language, $isFirstArticle);
        
        $articleData = [
            'title' => $data['title'] ?? $topic,
            'subtitle' => $data['subtitle'] ?? '',
            'deepDive' => $data['deepDive'] ?? '',
            'technicalConcepts' => $data['technicalConcepts'] ?? [],
            'steps' => $data['steps'] ?? [],
            'practiceLab' => $data['practiceLab'] ?? '',
            'resources' => $validatedResources,
            'resourceValidation' => [
                'articleStatus' => $validatedResources['article']['status'] ?? 'valid',
                'videoStatus' => $validatedResources['video']['status'] ?? 'valid',
                'validatedAt' => date('c'),
                'isFirstArticle' => $isFirstArticle
            ],
            'dayId' => $roadmapId . '-' . strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $topic)),
            'topic' => $topic,
            'task' => $task
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $articleData
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Article fetching failed: ' . $e->getMessage());
    }
}

function handleValidateUrl($data) {
    if (!isset($data['url'])) {
        throw new Exception('Missing required field: url');
    }
    
    $url = $data['url'];
    $result = validateUrl($url);
    
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
}
?>
