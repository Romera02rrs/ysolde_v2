"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Info, User, Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NavBar({
  darkMode,
  toggleDarkMode,
  setMobileMenuOpen,
  mobileMenuOpen,
}) {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">VoiceAI Assistant</h1>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">Pricing</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pricing Plans</DialogTitle>
                <DialogDescription>
                  Choose the plan that best fits your needs.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="border p-4 rounded-lg">
                  <h3 className="font-bold">Basic</h3>
                  <p>$9.99/month</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>100 queries/day</li>
                    <li>Basic support</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h3 className="font-bold">Pro</h3>
                  <p>$19.99/month</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>500 queries/day</li>
                    <li>Priority support</li>
                  </ul>
                </div>
                <div className="border p-4 rounded-lg">
                  <h3 className="font-bold">Enterprise</h3>
                  <p>Custom pricing</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Unlimited queries</li>
                    <li>24/7 support</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" onClick={toggleDarkMode}>
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost">
            <Info className="h-5 w-5" />
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">
              <User className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form className="space-y-4">
                  <Input placeholder="Email" type="email" />
                  <Input placeholder="Password" type="password" />
                  <Button className="w-full">Login</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form className="space-y-4">
                  <Input placeholder="Name" />
                  <Input placeholder="Email" type="email" />
                  <Input placeholder="Password" type="password" />
                  <Button className="w-full">Register</Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
