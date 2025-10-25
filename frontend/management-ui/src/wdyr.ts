/**
 * Why Did You Render (WDYR) Configuration
 *
 * Tracks unnecessary re-renders in React components.
 * Helps identify performance issues caused by:
 * - Props that haven't actually changed
 * - Unnecessary re-renders due to new object/function references
 * - Hook dependencies causing extra renders
 *
 * Only loads when VITE_DEVX_WDYR=true
 */

import React from 'react';
import { isDevXEnabled, devxLogger } from './config/devx.config';

if (isDevXEnabled('wdyr')) {
  devxLogger.info('Initializing Why Did You Render');

  import('@welldone-software/why-did-you-render')
    .then((wdyr) => {
      wdyr.default(React, {
        // Track all pure components (disabled by default for performance)
        trackAllPureComponents: false,

        // Track hooks - helps identify hook dependency issues
        trackHooks: true,

        // Track extra re-renders - most useful for debugging
        trackExtraReRenders: true,

        // Log only when values actually differ (reduces noise)
        logOnDifferentValues: true,

        // Collapse groups in console for better readability
        collapseGroups: true,

        // Log owner component info - helps trace re-render sources
        logOwnerReasons: true,

        // Exclude common UI library components that re-render frequently
        exclude: [
          // React Router
          /^BrowserRouter/,
          /^Routes/,
          /^Route/,
          /^Link/,
          /^Navigate/,

          // Common React patterns
          /^ForwardRef/,
          /^Memo/,
          /^Context/,

          // TanStack Query
          /^Query/,
          /^Mutation/,

          // Add other libraries as needed
          // /^Mui/,
          // /^Styled/,
          // /^Emotion/,
        ],

        // Include specific components for tracking (optional)
        // To track a component, add: MyComponent.whyDidYouRender = true
        include: [],

        // Notify on every render (very verbose, use for specific debugging)
        // notifier: console.log,
      });

      devxLogger.info('Why Did You Render initialized');
      devxLogger.debug(
        'To track a component, add: YourComponent.whyDidYouRender = true'
      );
    })
    .catch((error) => {
      devxLogger.error('Failed to load Why Did You Render:', error);
      console.error(
        'WDYR failed to load. Install with: npm install -D @welldone-software/why-did-you-render'
      );
    });
} else {
  devxLogger.debug('Why Did You Render disabled');
}

export {};
