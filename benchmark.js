'use strict'

const { readdirSync } = require('node:fs')
const { spawn } = require('node:child_process')
const autocannon = require('autocannon')
const { join } = require('node:path')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const benchmarkDir = join(__dirname, 'benchmark')

// Keep track of spawned processes and kill if runner killed
const processes = []

process.on('SIGINT', () => {
  for (const p of processes) {
    p.kill('SIGKILL')
  }
  process.exit()
})

;(async function () {
  const benchmarkFiles = readdirSync(benchmarkDir)
    // don't include setup file as a benchmark
    .filter((fileName) => fileName !== 'setup.js')
    // sort by filename length to ensure base benchmarks run first
    .sort((a, b) => a.length - b.length)

  for (const benchmarkFile of benchmarkFiles) {
    let benchmarkProcess

    try {
      // Spawn benchmark process
      benchmarkProcess = spawn('node', [benchmarkFile], {
        detached: true,
        cwd: benchmarkDir
      })

      processes.push(benchmarkProcess)

      // wait for `server listening` from benchmark
      await Promise.race([
        new Promise((resolve) => {
          const stdOutCb = (d) => {
            if (d.toString().includes('server listening')) {
              benchmarkProcess.stdout.removeListener('data', stdOutCb)
              resolve()
            }
          }
          benchmarkProcess.stdout.on('data', stdOutCb)
        }),
        delay(5000).then(() => Promise.reject(new Error('timed out waiting for server listening')))
      ])

      // fire single initial request as warmup
      await fetch('http://localhost:3000/')

      // run autocannon
      const result = await autocannon({
        url: 'http://localhost:3000/',
        connections: 100,
        duration: 5,
        pipelining: 10
      })
      if (result.non2xx > 0) {
        throw Object.assign(new Error('Some requests did not return 200'), {
          statusCodeStats: result.statusCodeStats
        })
      }
      console.log(`${benchmarkFile}: ${result.requests.average} req/s`)
    } catch (err) {
      console.error(`${benchmarkFile}:`, err)
    } finally {
      if (benchmarkProcess) {
        benchmarkProcess.kill('SIGKILL')
        processes.pop()
      }
    }
  }
})()
