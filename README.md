# Two Modulith Architecture
## Maven-based Spring Moduliths with pnpm wrapper

## Project Structure

```
conversational-navigation-system/
├── package.json                  # pnpm workspace root
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── pom.xml                      # Maven parent POM
├── backend/
│   ├── navigation-service/      # Modulith 1: AI Navigation & Real-time Chat
│   │   ├── pom.xml
│   │   ├── package.json         # pnpm scripts for Maven
│   │   └── src/
│   └── management-service/      # Modulith 2: Admin, Crawler & Operations
│       ├── pom.xml
│       ├── package.json         # pnpm scripts for Maven
│       └── src/
├── frontend/
│   ├── admin-portal/            # React MFE Admin Portal
│   │   └── package.json
│   ├── demo-app/                # Demo Application with MFE
│   │   └── package.json
│   └── widget-sdk/              # Chat Widget SDK
│       └── package.json
└── infrastructure/
    └── docker/
```

---

## Root Configuration Files

### `package.json` (Root)
```json
{
  "name": "conversational-navigation-system",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@8.10.0",
  "scripts": {
    "install": "pnpm install && pnpm run install:maven",
    "install:maven": "mvn clean install -DskipTests",
    "dev": "pnpm run --parallel dev",
    "dev:navigation": "pnpm --filter navigation-service dev",
    "dev:management": "pnpm --filter management-service dev",
    "dev:frontend": "pnpm run --filter './frontend/*' dev",
    "dev:admin": "pnpm --filter admin-portal dev",
    "dev:demo": "pnpm --filter demo-app dev",
    "build": "pnpm run build:backend && pnpm run build:frontend",
    "build:backend": "mvn clean package",
    "build:frontend": "pnpm run --filter './frontend/*' build",
    "test": "pnpm run test:backend && pnpm run test:frontend",
    "test:backend": "mvn test",
    "test:frontend": "pnpm run --filter './frontend/*' test",
    "docker:build": "pnpm run --parallel docker:build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "clean": "mvn clean && pnpm run --parallel clean"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'backend/*'
  - 'frontend/*'
  - 'infrastructure/*'
```

### `pom.xml` (Parent POM)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.navsystem</groupId>
    <artifactId>conversational-navigation-parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <properties>
        <java.version>21</java.version>
        <spring-modulith.version>1.1.0</spring-modulith.version>
        <langchain4j.version>0.33.0</langchain4j.version>
        <pgvector.version>0.1.4</pgvector.version>
        <playwright.version>1.40.0</playwright.version>
    </properties>

    <modules>
        <module>backend/navigation-service</module>
        <module>backend/management-service</module>
    </modules>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.modulith</groupId>
                <artifactId>spring-modulith-bom</artifactId>
                <version>${spring-modulith.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

---

## Modulith 1: Navigation Service
**Path:** `backend/navigation-service/`  
**Purpose:** AI-powered navigation intelligence and real-time user interactions  
**Architecture:** Reactive (Spring WebFlux)

### `package.json`
```json
{
  "name": "navigation-service",
  "version": "1.0.0",
  "description": "AI-powered navigation service with real-time chat capabilities",
  "scripts": {
    "dev": "mvn spring-boot:run -Dspring-boot.run.profiles=dev",
    "build": "mvn clean package",
    "test": "mvn test",
    "test:modulith": "mvn test -Dtest=ModulithTests",
    "docker:build": "docker build -t navsystem/navigation-service .",
    "clean": "mvn clean"
  }
}
```

### `pom.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.navsystem</groupId>
        <artifactId>conversational-navigation-parent</artifactId>
        <version>1.0.0</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>reactive-modulith</artifactId>
    <name>Reactive Modulith</name>

    <dependencies>
        <!-- Spring Boot Reactive -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <!-- Spring Modulith -->
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-starter-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-starter-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-events-api</artifactId>
        </dependency>

        <!-- Database (R2DBC for reactive) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-r2dbc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>r2dbc-postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>com.pgvector</groupId>
            <artifactId>pgvector</artifactId>
            <version>${pgvector.version}</version>
        </dependency>

        <!-- LangChain4j for AI/ML -->
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j</artifactId>
            <version>${langchain4j.version}</version>
        </dependency>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-open-ai</artifactId>
            <version>${langchain4j.version}</version>
        </dependency>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-pgvector</artifactId>
            <version>${langchain4j.version}</version>
        </dependency>

        <!-- WebSocket Support -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### Module Structure
```
navigation-service/
└── src/
    ├── main/
    │   ├── java/com/navsystem/navigation/
    │   │   ├── NavigationServiceApplication.java
    │   │   ├── gateway/                 # API Gateway module
    │   │   │   ├── package-info.java   # @ApplicationModule
    │   │   │   ├── GatewayConfiguration.java
    │   │   │   └── internal/           # Module internals
    │   │   ├── realtime/               # Real-time chat module
    │   │   │   ├── package-info.java
    │   │   │   ├── WebSocketHandler.java
    │   │   │   ├── ChatController.java
    │   │   │   └── internal/
    │   │   ├── intelligence/          # AI/ML intelligence module
    │   │   │   ├── package-info.java
    │   │   │   ├── NavigationIntelligence.java
    │   │   │   ├── LangChainOrchestrator.java
    │   │   │   ├── IntentEngine.java
    │   │   │   └── internal/
    │   │   ├── guidance/              # Navigation guidance module
    │   │   │   ├── package-info.java
    │   │   │   ├── GuidanceService.java
    │   │   │   ├── PathSuggester.java
    │   │   │   └── internal/
    │   │   ├── memory/                # Vector memory module
    │   │   │   ├── package-info.java
    │   │   │   ├── VectorMemoryService.java
    │   │   │   ├── EmbeddingRepository.java
    │   │   │   └── internal/
    │   │   └── shared/                # Shared kernel
    │   │       ├── events/            # Domain events
    │   │       ├── dto/               # Shared DTOs
    │   │       └── config/            # Shared config
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/navsystem/navigation/
            └── ModulithTests.java      # Spring Modulith tests
```

### Core Modulith Configuration
```java
// NavigationServiceApplication.java
@SpringBootApplication
@EnableModulith
public class NavigationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NavigationServiceApplication.class, args);
    }
}

// gateway/package-info.java
@ApplicationModule(
    displayName = "API Gateway",
    allowedDependencies = {"realtime", "guidance", "shared"}
)
package com.navsystem.navigation.gateway;

// intelligence/NavigationIntelligence.java
@Service
@RequiredArgsConstructor
public class NavigationIntelligence {
    private final WebClient openAIClient;
    private final ApplicationEventPublisher events;
    
    public Mono<NavigationResponse> processQuery(String query, String sessionId) {
        return classifyIntent(query)
            .flatMap(intent -> generateEmbedding(query)
                .flatMap(this::searchVectors)
                .map(results -> buildResponse(intent, results))
            )
            .doOnNext(response -> 
                events.publishEvent(new NavigationSuggestedEvent(sessionId, response))
            );
    }
    
    @EventListener
    @Async
    public void onPageCrawled(PageCrawledEvent event) {
        // React to events from blocking modulith
        indexPage(event.getPageData())
            .subscribe();
    }
}
```

---

## Modulith 2: Management Service
**Path:** `backend/management-service/`  
**Purpose:** System administration, content ingestion, and operational control  
**Architecture:** Traditional (Spring MVC)

### `package.json`
```json
{
  "name": "management-service",
  "version": "1.0.0",
  "description": "System management service for administration, crawling, and operations",
  "scripts": {
    "dev": "mvn spring-boot:run -Dspring-boot.run.profiles=dev",
    "build": "mvn clean package",
    "test": "mvn test",
    "test:modulith": "mvn test -Dtest=ModulithTests",
    "docker:build": "docker build -t navsystem/management-service .",
    "crawl": "mvn spring-boot:run -Dspring-boot.run.arguments=--crawl",
    "clean": "mvn clean"
  }
}
```

### `pom.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.navsystem</groupId>
        <artifactId>conversational-navigation-parent</artifactId>
        <version>1.0.0</version>
        <relativePath>../../pom.xml</relativePath>
    </parent>

    <artifactId>blocking-modulith</artifactId>
    <name>Blocking Modulith</name>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Modulith -->
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-starter-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.modulith</groupId>
            <artifactId>spring-modulith-starter-jpa</artifactId>
        </dependency>

        <!-- Database (JPA for blocking) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>

        <!-- Spring Batch -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-batch</artifactId>
        </dependency>

        <!-- Web Crawler -->
        <dependency>
            <groupId>com.microsoft.playwright</groupId>
            <artifactId>playwright</artifactId>
            <version>${playwright.version}</version>
        </dependency>

        <!-- Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
    </dependencies>
</project>
```

### Module Structure
```
management-service/
└── src/
    ├── main/
    │   ├── java/com/navsystem/management/
    │   │   ├── ManagementServiceApplication.java
    │   │   ├── administration/         # Admin operations module
    │   │   │   ├── package-info.java
    │   │   │   ├── AdminController.java
    │   │   │   ├── TenantManager.java
    │   │   │   └── internal/
    │   │   ├── access/                 # Access control module
    │   │   │   ├── package-info.java
    │   │   │   ├── AccessController.java
    │   │   │   ├── JwtTokenService.java
    │   │   │   └── internal/
    │   │   ├── ingestion/             # Content ingestion module
    │   │   │   ├── package-info.java
    │   │   │   ├── CrawlerController.java
    │   │   │   ├── PlaywrightEngine.java
    │   │   │   ├── ContentExtractor.java
    │   │   │   └── internal/
    │   │   ├── operations/            # Batch operations module
    │   │   │   ├── package-info.java
    │   │   │   ├── BatchOrchestrator.java
    │   │   │   ├── ScheduledJobs.java
    │   │   │   ├── MaintenanceTasks.java
    │   │   │   └── internal/
    │   │   ├── insights/              # Analytics & reporting module
    │   │   │   ├── package-info.java
    │   │   │   ├── AnalyticsService.java
    │   │   │   ├── ReportGenerator.java
    │   │   │   └── internal/
    │   │   └── shared/                # Shared kernel
    │   │       ├── entities/
    │   │       ├── repositories/
    │   │       └── events/
    │   └── resources/
    │       └── application.yml
    └── test/
```

---

## Frontend Applications

### Admin Portal (MFE Host)
**Path:** `frontend/admin-portal/`  
**Port:** 3000  
**Purpose:** Administration interface for managing the system

### `frontend/admin-portal/package.json`
```json
{
  "name": "admin-portal",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development --port 3000",
    "build": "webpack --mode production",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "@mui/material": "^5.14.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "@module-federation/enhanced": "^0.1.0"
  }
}
```

### Demo Application (MFE Consumer)
**Path:** `frontend/demo-app/`  
**Port:** 3001  
**Purpose:** Showcase the navigation system capabilities with sample portfolio site

### `frontend/demo-app/package.json`
```json
{
  "name": "demo-app",
  "version": "1.0.0",
  "description": "Demo financial portfolio application with conversational navigation",
  "scripts": {
    "dev": "webpack serve --mode development --port 3001",
    "build": "webpack --mode production",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "recharts": "^2.10.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "@module-federation/enhanced": "^0.1.0",
    "html-webpack-plugin": "^5.5.3",
    "@babel/core": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "@babel/preset-typescript": "^7.23.0",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3",
    "typescript": "^5.2.2"
  }
}
```

### Demo App Structure
```
frontend/demo-app/
├── src/
│   ├── index.tsx                # App entry point
│   ├── App.tsx                  # Main app component
│   ├── bootstrap.tsx            # Module federation bootstrap
│   ├── remotes.d.ts             # TypeScript definitions for remotes
│   ├── pages/
│   │   ├── Dashboard.tsx        # Portfolio dashboard
│   │   ├── Holdings.tsx         # Holdings page
│   │   ├── Performance.tsx      # Performance analytics
│   │   ├── Transactions.tsx     # Transaction history
│   │   └── Documents.tsx        # Documents page
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx       # App header
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── Footer.tsx       # App footer
│   │   ├── Portfolio/
│   │   │   ├── PortfolioChart.tsx
│   │   │   ├── AssetAllocation.tsx
│   │   │   └── PerformanceMetrics.tsx
│   │   └── ChatWidget/
│   │       └── ChatWidgetLoader.tsx  # Loads chat widget MFE
│   └── styles/
│       └── globals.css
├── public/
│   └── index.html
├── webpack.config.js            # Webpack with Module Federation
└── tsconfig.json
```

### `frontend/demo-app/webpack.config.js`
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index',
  output: {
    publicPath: 'http://localhost:3001/',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'demoApp',
      remotes: {
        widgetSDK: 'widgetSDK@http://localhost:3002/remoteEntry.js',
        adminComponents: 'adminPortal@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: '^18.2.0' 
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^18.2.0' 
        },
        'react-router-dom': { 
          singleton: true,
          requiredVersion: '^6.20.0'
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 3001,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    hot: true,
  },
};
```

### `frontend/demo-app/src/App.tsx`
```typescript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Holdings from './pages/Holdings';
import Performance from './pages/Performance';
import Transactions from './pages/Transactions';
import Documents from './pages/Documents';

// Lazy load the chat widget from widget-sdk MFE
const ChatWidget = lazy(() => import('widgetSDK/ChatWidget'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
        
        {/* Chat Widget - Loaded as MFE */}
        <Suspense fallback={<div>Loading chat...</div>}>
          <ChatWidget 
            position="bottom-right"
            apiEndpoint="http://localhost:8080"
            theme="light"
          />
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
```

### `frontend/demo-app/src/pages/Dashboard.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, PieChart, BarChart } from 'recharts';
import PortfolioChart from '../components/Portfolio/PortfolioChart';
import AssetAllocation from '../components/Portfolio/AssetAllocation';

const Dashboard: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 485320.50,
    dayChange: 3240.25,
    dayChangePercent: 0.67,
    positions: 24,
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard"
    >
      <h1>Portfolio Overview</h1>
      
      {/* Portfolio Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Value</h3>
          <p className="value">${portfolioData.totalValue.toLocaleString()}</p>
          <span className={`change ${portfolioData.dayChange > 0 ? 'positive' : 'negative'}`}>
            {portfolioData.dayChange > 0 ? '+' : ''}{portfolioData.dayChange.toLocaleString()} 
            ({portfolioData.dayChangePercent}%)
          </span>
        </div>
        
        <div className="card">
          <h3>Positions</h3>
          <p className="value">{portfolioData.positions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <PortfolioChart />
        <AssetAllocation />
      </div>

      {/* Quick Actions - These can be triggered via chat */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <p>Try asking the chat assistant:</p>
        <ul>
          <li>"Show me my tech stocks"</li>
          <li>"How is my portfolio performing?"</li>
          <li>"Navigate to recent transactions"</li>
          <li>"Find my tax documents"</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default Dashboard;
```

### Widget SDK Updates for MFE
**Path:** `frontend/widget-sdk/`

### `frontend/widget-sdk/package.json`
```json
{
  "name": "widget-sdk",
  "version": "1.0.0",
  "description": "Embeddable chat widget for conversational navigation",
  "scripts": {
    "dev": "webpack serve --mode development --port 3002",
    "build": "webpack --mode production",
    "build:standalone": "rollup -c rollup.config.js",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "socket.io-client": "^4.5.4"
  },
  "devDependencies": {
    "webpack": "^5.89.0",
    "@module-federation/enhanced": "^0.1.0",
    "rollup": "^3.29.0"
  }
}
```

### `frontend/widget-sdk/webpack.config.js`
```javascript
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index',
  output: {
    publicPath: 'http://localhost:3002/',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'widgetSDK',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatWidget': './src/components/ChatWidget',
        './NavigationHelper': './src/components/NavigationHelper',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  devServer: {
    port: 3002,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
```

---

## Application Configuration

### `navigation-service/src/main/resources/application.yml`
```yaml
spring:
  application:
    name: navigation-service
  
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/navdb
    username: postgres
    password: postgres
  
  modulith:
    events:
      jdbc:
        enabled: true  # Event publication registry
    
server:
  port: 8080

openai:
  api-key: ${OPENAI_API_KEY}
  model: gpt-4-turbo-preview

# Low volume optimizations
navigation:
  pool:
    max-connections: 10  # Small connection pool
  cache:
    ttl: 300  # 5 minutes in-memory cache
```

### `management-service/src/main/resources/application.yml`
```yaml
spring:
  application:
    name: management-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/navdb
    username: postgres
    password: postgres
    hikari:
      maximum-pool-size: 5  # Small pool for low volume
  
  jpa:
    hibernate:
      ddl-auto: validate
  
  batch:
    jdbc:
      initialize-schema: always
  
server:
  port: 8090

crawler:
  max-concurrent: 2  # Low concurrency for low volume
  timeout: 30000
```

---

## Docker Compose

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: navdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./infrastructure/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
      - postgres_data:/var/lib/postgresql/data

  navigation-service:
    build: 
      context: ./backend/navigation-service
      dockerfile: ../../infrastructure/docker/navigation.Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres

  management-service:
    build:
      context: ./backend/management-service
      dockerfile: ../../infrastructure/docker/management.Dockerfile
    ports:
      - "8090:8090"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
    depends_on:
      - postgres

  admin-portal:
    build: ./frontend/admin-portal
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8090
    depends_on:
      - navigation-service
      - management-service

  demo-app:
    build: ./frontend/demo-app
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
    depends_on:
      - navigation-service

  widget-sdk:
    build: ./frontend/widget-sdk
    ports:
      - "3002:3002"
    environment:
      - REACT_APP_WS_URL=ws://localhost:8080

volumes:
  postgres_data:
```

---

## Development Workflow

### Initial Setup
```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d postgres

# Run both services in development
pnpm dev

# Or run individually
pnpm dev:navigation
pnpm dev:management
```

### Testing
```bash
# Test everything
pnpm test

# Test modulith structure
pnpm run --filter navigation-service test:modulith
pnpm run --filter management-service test:modulith
```

### Building
```bash
# Build everything
pnpm build

# Build Docker images
pnpm docker:build

# Deploy
docker-compose up
```

---

## Inter-Modulith Communication

### Event-Based (Async)
```java
// Management service publishes
@Service
public class CrawlerService {
    @Autowired ApplicationEventPublisher events;
    
    public void crawlPage(String url) {
        PageData data = crawl(url);
        events.publishEvent(new PageCrawledEvent(data));
    }
}

// Navigation service listens
@Service
public class NavigationIndexer {
    @EventListener
    @Async
    public void onPageCrawled(PageCrawledEvent event) {
        indexPage(event.getData()).subscribe();
    }
}
```

### REST API (Sync)
```java
// Management calls Navigation
@Service
public class AdminService {
    private final RestTemplate rest = new RestTemplate();
    
    public void triggerReindex() {
        rest.postForObject(
            "http://localhost:8080/api/reindex",
            request,
            Void.class
        );
    }
}
```

---

## Benefits of This Architecture

1. **Simple Development**: Just `pnpm dev` to run everything
2. **Clear Boundaries**: Two moduliths with distinct responsibilities
3. **No Redis Needed**: In-memory caching for low volume
4. **Modulith Benefits**:
    - Compile-time module dependency checking
    - Automatic architecture documentation
    - Event publication registry
5. **pnpm Benefits**:
    - Single command for both Maven and npm
    - Workspace management
    - Parallel execution
6. **MFE Architecture**:
    - Independent deployment of frontend modules
    - Shared dependencies optimization
    - Runtime integration of chat widget
7. **Demo Application**:
    - Showcases real-world usage
    - Tests navigation capabilities
    - Portfolio site example
8. **Low Volume Optimizations**:
    - Small connection pools
    - In-memory caching
    - Minimal infrastructure

## Architecture Overview

### Backend Services
- **navigation-service** (port 8080): AI-powered navigation, WebSocket chat, real-time features
- **management-service** (port 8090): Admin operations, web crawling, batch jobs

### Frontend Applications
- **admin-portal** (port 3000): Administration interface for system management
- **demo-app** (port 3001): Sample financial portfolio app demonstrating navigation
- **widget-sdk** (port 3002): Reusable chat widget exposed as MFE

### Module Federation Flow
```
demo-app (Host)
    ├── Loads widget-sdk/ChatWidget (Remote)
    ├── Can load adminPortal/components (Remote)
    └── Shares React, React-DOM, Router
```

The demo application serves as a perfect testing ground and showcase, demonstrating how the conversational navigation system works with a realistic financial portfolio interface. Users can interact with the chat widget to navigate through different sections of the portfolio using natural language.