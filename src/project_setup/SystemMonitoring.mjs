// // src/project_setup/SystemMonitoring.mjs
// import os from 'os';
// import process from 'process';
// import netstat from 'node-netstat';
// import client from 'prom-client';

// export default class SystemMonitoring {
//     constructor() {
//         this.register = new client.Registry();
//         this.setupMetrics();

//         // Store historical data
//         this.cpuUsageHistory = [];
//         this.memoryUsageHistory = [];
//         this.networkTrafficHistory = [];

//         this.monitorNetworkTraffic();
//         this.logSystemMetrics();
//     }

//     setupMetrics() {
//         this.cpuUsageGauge = new client.Gauge({
//             name: 'node_cpu_usage',
//             help: 'CPU Usage in percent',
//         });

//         this.memoryUsageGauge = new client.Gauge({
//             name: 'node_memory_usage',
//             help: 'Memory Usage in bytes',
//         });

//         this.register.registerMetric(this.cpuUsageGauge);
//         this.register.registerMetric(this.memoryUsageGauge);
//     }

//     logSystemMetrics() {
//         setInterval(() => {
//             const cpuLoad = os.loadavg()[0];
//             const cpuPercentage = (cpuLoad / os.cpus().length) * 100;
//             const memoryUsage = process.memoryUsage();

//             const timestamp = new Date().toISOString(); // Get current timestamp

//             // Store CPU and memory usage history
//             this.cpuUsageHistory.push({ time: timestamp, value: cpuPercentage });
//             this.memoryUsageHistory.push({ time: timestamp, value: memoryUsage.rss });

//             // Limit history size to the last 60 records
//             if (this.cpuUsageHistory.length > 60) this.cpuUsageHistory.shift();
//             if (this.memoryUsageHistory.length > 60) this.memoryUsageHistory.shift();

//             // Validate and log CPU and memory values
//             if (typeof cpuPercentage === 'number' && !isNaN(cpuPercentage)) {
//                 this.cpuUsageGauge.set(cpuPercentage);
//                 console.log(`CPU Load: ${cpuPercentage}`);
//             } else {
//                 console.warn('Invalid CPU load value');
//             }

//             if (typeof memoryUsage.rss === 'number' && !isNaN(memoryUsage.rss)) {
//                 this.memoryUsageGauge.set(memoryUsage.rss);
//                 console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
//             } else {
//                 console.warn('Invalid memory usage value');
//             }
//         }, 10000);
//     }

//     monitorNetworkTraffic() {
//         //console.log('Monitoring network traffic...');

//         setInterval(() => {
//             netstat({}, (data) => {
//                // console.log(`Network Stats:`, data);

//                 // Filter to ensure we only log connections with actual addresses
//                 if (data.local.address !== null && data.remote.address !== null) {
//                     const timestamp = new Date().toISOString();

//                     // Push the connection object to the history
//                     this.networkTrafficHistory.push({
//                         time: timestamp,
//                         local: data.local,
//                         remote: data.remote,
//                         state: data.state,
//                         protocol: data.protocol,
//                         pid: data.pid
//                     });

//                     // Limit history size to the last 60 records
//                     if (this.networkTrafficHistory.length > 60) this.networkTrafficHistory.shift();
//                 } else {
//                     console.warn('Received data with null addresses or ports:', data);
//                 }

//                // console.log(`Updated Network Traffic History:`, this.networkTrafficHistory);
//             });
//         }, 10000); // 10-second interval
//     }

//     exposeMetrics(app) {
//         app.get('/metrics', async (req, res) => {
//             res.set('Content-Type', this.register.contentType);
//             res.end(await this.register.metrics());
//         });

//         app.get('/cpu-usage-history', (req, res) => {
//             res.json(this.cpuUsageHistory);
//         });

//         app.get('/memory-usage-history', (req, res) => {
//             res.json(this.memoryUsageHistory);
//         });

//         app.get('/network-traffic-history', (req, res) => {
//             res.json(this.networkTrafficHistory);
//         });
//     }
// }
