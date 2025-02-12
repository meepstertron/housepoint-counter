'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Github, Linkedin, Twitter } from 'lucide-react'

export default function About_Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">About Our App</h1>
      
      <Tabs defaultValue="app" className="w-full mb-12">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="app">Our App</TabsTrigger>
          <TabsTrigger value="company">Our Company</TabsTrigger>
        </TabsList>
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>App Name</CardTitle>
              <CardDescription>Revolutionizing the way you [app's main function]</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                [App Name] is designed to [brief description of what the app does]. 
                Whether you're a [target user type] or a [another user type], our app 
                provides the tools you need to [main benefit of the app].
              </p>
              <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>[Feature 1]: [Brief description]</li>
                <li>[Feature 2]: [Brief description]</li>
                <li>[Feature 3]: [Brief description]</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Name</CardTitle>
              <CardDescription>Innovating for a better tomorrow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                At [Company Name], we're passionate about creating technology that makes 
                a difference. Founded in [year], we've been at the forefront of [industry/field], 
                constantly pushing the boundaries of what's possible.
              </p>
              <p className="mb-4">
                Our team of dedicated professionals brings together expertise in [relevant fields], 
                allowing us to deliver cutting-edge solutions like [App Name].
              </p>
              <h3 className="text-lg font-semibold mb-2">Our Mission:</h3>
              <p>
                To empower users with intuitive, efficient, and innovative tools that enhance 
                their daily lives and professional capabilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Meet the Developer</CardTitle>
          <CardDescription>The mind behind [App Name]</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-4">
            <img
              src="https://placehold.co/150"
              alt="Developer"
              width={150}
              height={150}
              className="rounded-full mb-4"
            />
            <h3 className="text-xl font-semibold">[Developer Name]</h3>
            <p className="text-muted-foreground">[Job Title]</p>
          </div>
          <p className="text-center mb-6">
            [Brief bio or statement from the developer]
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <a href="https://github.com/[username]">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://aedin.com/in/[username]">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://twitter.com/[username]">
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://[personal-website].com">
                <ExternalLink className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-12 flex flex-col items-center">
        <img
          src="https://placehold.co/100x50"
          alt="Company Logo"
          width={100}
          height={50}
          className="mb-4"
        />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} [Company Name]. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

