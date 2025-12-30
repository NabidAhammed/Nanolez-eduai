<?php
// Configuration for EduAI-NanoLez API

// API Keys - In production, these should be environment variables
define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY'] ?? '');
define('GROQ_API_KEY', $_ENV['GROQ_API_KEY'] ?? '');
define('MISTRAL_API_KEY', $_ENV['MISTRAL_API_KEY'] ?? '');

// Database configuration for authentication
define('DB_HOST', $_ENV['DB_HOST'] ?? 'sql203.infinityfree.com');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'if0_40780931_eduai_nanolez');
define('DB_USER', $_ENV['DB_USER'] ?? 'if0_40780931');
define('DB_PASS', $_ENV['DB_PASS'] ?? getenv('DB_PASS'));
define('DB_CHARSET', 'utf8mb4');

// Email configuration for verification
define('SMTP_HOST', $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com');
define('SMTP_PORT', $_ENV['SMTP_PORT'] ?? 587);
define('SMTP_USERNAME', $_ENV['SMTP_USERNAME'] ?? '');
define('SMTP_PASSWORD', $_ENV['SMTP_PASSWORD'] ?? '');
define('FROM_EMAIL', $_ENV['FROM_EMAIL'] ?? 'noreply@eduaI-nanolez.com');
define('FROM_NAME', 'EduAI-NanoLez');
define('APP_URL', $_ENV['APP_URL'] ?? ('http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . $_SERVER['HTTP_HOST']));

// Logging configuration
define('LOG_FILE', __DIR__ . '/logs/api.log');
define('LOG_ERRORS', true);

// Rate limiting
define('MAX_REQUESTS_PER_MINUTE', 60);
define('RATE_LIMIT_WINDOW', 60); // seconds

// AI Model settings
define('MAX_RETRIES_PER_MODEL', 3);
define('RETRY_DELAYS', [1000, 2000, 4000]); // milliseconds

// Known good domains for URL validation
define('KNOWN_GOOD_DOMAINS', [
    'developer.mozilla.org', 'freecodecamp.org', 'w3schools.com', 'javascript.info',
    'css-tricks.com', 'web.dev', 'tutorialspoint.com', 'codecademy.com',
    'kaggle.com', 'pandas.pydata.org', 'numpy.org', 'scikit-learn.org',
    'coursera.org', 'edx.org', 'khanacademy.org', 'udemy.com',
    'youtube.com', 'youtu.be'
]);

// Verified educational platforms
define('VERIFIED_EDUCATIONAL_PLATFORMS', [
    'programming' => [
        'https://developer.mozilla.org',
        'https://www.freecodecamp.org',
        'https://javascript.info',
        'https://web.dev',
        'https://css-tricks.com',
        'https://www.w3schools.com',
        'https://www.codecademy.com',
        'https://www.smashingmagazine.com',
        'https://www.tutorialspoint.com',
        'https://scrimba.com',
        'https://frontendmasters.com',
        'https://www.theodinproject.com'
    ],
    'dataScience' => [
        'https://www.kaggle.com/learn',
        'https://pandas.pydata.org/docs/',
        'https://numpy.org/doc/',
        'https://scikit-learn.org/stable/',
        'https://www.dataquest.io',
        'https://www.coursera.org/browse/data-science',
        'https://www.edx.org/learn/data-science',
        'https://www.datacamp.com',
        'https://towardsdatascience.com',
        'https://jovian.ai',
        'https://colab.research.google.com'
    ],
    'general' => [
        'https://www.coursera.org',
        'https://www.edx.org',
        'https://www.khanacademy.org',
        'https://www.udemy.com',
        'https://www.youtube.com/c/freecodecamp',
        'https://www.youtube.com/c/ProgrammingwithMosh',
        'https://www.youtube.com/user/thenewboston',
        'https://www.sattacademy.com',
        'https://www.brilliant.org',
        'https://www.skillshare.com',
        'https://www.linkedin.com/learning',
        'https://www.mitocw.riku.com'
    ]
]);

// Language-specific search queries
define('LANGUAGE_SEARCH_QUERIES', [
    'en' => 'tutorial guide',
    'es' => 'tutorial guía',
    'fr' => 'tutoriel guide',
    'de' => 'tutorial anleitung',
    'hi' => 'ट्यूटोरियल गाइड',
    'bn' => 'টিউটোরিয়াল গাইড',
    'ja' => 'チュートリアル ガイド',
    'ar' => 'تعليمي دليل'
]);

// Initialize logs directory
if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}
?>
