"use client"

import React, { useCallback, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TailSpin } from "react-loader-spinner"

interface BenchmarkData {
  name: string
  value: number
  totalRequests: number
  successfulResponses: number
}

interface BenchmarkGroup {
  name: string
  data: BenchmarkData[]
  unit: string
}

const apiEndpoints = [
  { name: "Albato", url: "https://h.albato.com/wh/38/1lft158/FoO24OVMUQY5YcCtZerwmfCvguwS1jzQwMdCC3dUFnE" },
  { name: 'ActivePieces', url: 'https://cloud.activepieces.com/api/v1/webhooks/LAOgyh0liWzE3WkyhiVw6/sync' },
  { name: "LateNode", url: "https://webhook.latenode.com/1150/dev/hello" },
  { name: "Yup Code", url: "https://cloud.yepcode.io/api/rutics/webhooks/test" },
  { name: "Next.js", url: "/api/test" }
]

const DBReadEndpoints = [
  { name: "ActivePieces", url: "https://cloud.activepieces.com/api/v1/webhooks/QmeoqZXcxmwR6MTS6Orv7/sync" },
  { name: "LateNode", url: "https://webhook.latenode.com/1150/dev/hello" },
  { name: "Yup Code", url: "https://cloud.yepcode.io/api/rutics/webhooks/db-read" },
  { name: "Next.js", url: "/api/readDB" }
]

const measureLatency = async (url: string, samples: number = 10): Promise<[number, number, number]> => {
  let totalRequests = 0
  let successfulResponses = 0
  const latencies = await Promise.all(
    Array(samples).fill(null).map(async () => {
      totalRequests++
      const start = performance.now()
      try {
        const response = await fetch(url, { 
          mode: 'no-cors',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (response.ok) successfulResponses++
        return performance.now() - start
      } catch {
        return NaN
      }
    })
  )
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
  return [avgLatency, totalRequests, successfulResponses]
}

const measureThroughput = async (url: string, duration: number = 10000): Promise<[number, number, number]> => {
  const start = performance.now()
  let operations = 0
  let successfulResponses = 0
  while (performance.now() - start < duration) {
    try {
      const response = await fetch(url, { 
        mode: 'no-cors',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (response.ok) successfulResponses++
    } catch {}
    operations++
  }
  return [operations / (duration / 1000), operations, successfulResponses]
}

const BenchmarkChart: React.FC<{ data: BenchmarkData[], unit: string, isLoading: boolean }> = ({ data, unit, isLoading }) => (
  <div className="flex flex-col items-center justify-center h-[400px]">
    {isLoading ? (
      <TailSpin color="hsl(var(--primary))" height={80} width={80} />
    ) : data.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="hsl(var(--primary))" name={unit} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Platform</th>
                <th className="text-right">Total Requests</th>
                <th className="text-right">Successful Responses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.name}>
                  <td className="text-left">{item.name}</td>
                  <td className="text-right">{item.totalRequests}</td>
                  <td className="text-right">{item.successfulResponses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ) : (
      <div>No data available. Click the button to start benchmarking.</div>
    )}
  </div>
)

export function ComprehensiveBenchmark(): JSX.Element {
  const [benchmarkGroups, setBenchmarkGroups] = useState<BenchmarkGroup[]>([
    { name: 'Hello World API Latency(Less is better)', data: [], unit: 'ms' },
    { name: 'API Throughput(More is better)', data: [], unit: 'req/s' },
    { name: 'Database Read Latency(Less is better)', data: [], unit: 'ms' }
  ])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleBenchmark = useCallback(async (groupName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let results: BenchmarkData[] = []
      switch (groupName) {
        case 'Hello World API Latency(Less is better)':
          results = await Promise.all(apiEndpoints.map(async (endpoint) => {
            const [latency, totalRequests, successfulResponses] = await measureLatency(endpoint.url, 10)
            return {
              name: endpoint.name,
              value: Math.round(latency),
              totalRequests,
              successfulResponses
            }
          }))
          break
        case 'API Throughput(More is better)':
          results = await Promise.all(apiEndpoints.map(async (endpoint) => {
            const [throughput, totalRequests, successfulResponses] = await measureThroughput(endpoint.url, 15000)
            return {
              name: endpoint.name,
              value: Math.round(throughput),
              totalRequests,
              successfulResponses
            }
          }))
          break
        case 'Database Read Latency(Less is better)':
          results = await Promise.all(DBReadEndpoints.map(async (endpoint) => {
            const [latency, totalRequests, successfulResponses] = await measureLatency(endpoint.url, 10)
            return {
              name: endpoint.name,
              value: Math.round(latency),
              totalRequests,
              successfulResponses
            }
          }))
          break
      }

      setBenchmarkGroups(prevGroups => 
        prevGroups.map(group => 
          group.name === groupName ? { ...group, data: results } : group
        )
      )
    } catch (err) {
      setError(`Failed to complete benchmark for ${groupName}. Please try again later.`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Comprehensive API Benchmarking Tool</CardTitle>
        <CardDescription>Measure API latency and throughput across different services</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <Tabs defaultValue={benchmarkGroups[0].name}>
          <TabsList className="grid w-full grid-cols-3">
            {benchmarkGroups.map((group) => (
              <TabsTrigger 
                key={group.name} 
                value={group.name} 
                className='data-[state=active]:bg-white'
              >
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {benchmarkGroups.map((group) => (
            <TabsContent key={group.name} value={group.name}>
              <BenchmarkChart data={group.data} unit={group.unit} isLoading={isLoading} />
              <div className="mt-4 flex justify-center">
                <Button onClick={() => handleBenchmark(group.name)} disabled={isLoading}>
                  {group.data.length > 0 ? 'Test Again' : 'Start Benchmarking'}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}