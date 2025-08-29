"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RefreshCw, Wifi, AlertTriangle, Server } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isServerError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isServerError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a server connection error
    const isServerError = 
      error.message.includes('SERVER_CONNECTION_ERROR') ||
      error.message.includes('fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('ERR_NETWORK') ||
      error.name === 'ServerConnectionError' ||
      (typeof window !== "undefined" && window.serverError);

    return {
      hasError: true,
      error,
      errorInfo: null,
      isServerError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      isServerError: this.isServerError(error),
    });

    // Log error to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Boundary Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  private isServerError(error: Error): boolean {
    return (
      error.message.includes('SERVER_CONNECTION_ERROR') ||
      error.message.includes('fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('ERR_NETWORK') ||
      error.name === 'ServerConnectionError' ||
      (typeof window !== "undefined" && window.serverError)
    );
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isServerError: false,
    });
    
    // Clear server error flags
    if (typeof window !== "undefined") {
      delete window.serverError;
      delete window.lastServerError;
    }
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Server Error Page
      if (this.state.isServerError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Server className="w-10 h-10 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    خطأ في الاتصال بالسيرفر
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    لا يمكن الاتصال بالسيرفر في الوقت الحالي
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-gray-500 leading-relaxed">
                      عذراً، حدث خطأ في الاتصال بالسيرفر. قد يكون السيرفر متوقفاً أو هناك مشكلة في الشبكة.
                    </p>
                    
                    {this.state.error && (
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-mono">
                          {this.state.error.message}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Button onClick={this.handleRetry} className="w-full" size="lg">
                      <RefreshCw className="w-4 h-4 ml-2" />
                      إعادة المحاولة
                    </Button>
                    
                    <Button variant="outline" onClick={this.handleGoHome} className="w-full" size="lg">
                      <Home className="w-4 h-4 ml-2" />
                      العودة للرئيسية
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-400 mb-2">
                      نصائح لحل المشكلة:
                    </p>
                    <ul className="text-sm text-gray-500 text-right space-y-1">
                      <li>• تحقق من اتصالك بالإنترنت</li>
                      <li>• انتظر قليلاً وحاول مرة أخرى</li>
                      <li>• تأكد من أن السيرفر يعمل على البورت 5000</li>
                      <li>• امسح ذاكرة التخزين المؤقت للمتصفح</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
                </p>
              </div>
            </div>
          </div>
        );
      }

      // General Error Page
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  حدث خطأ غير متوقع
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  عذراً، حدث خطأ في التطبيق
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-gray-500 leading-relaxed">
                  حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
                </p>
                
                {this.state.error && (
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-mono">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Button onClick={this.handleRetry} className="w-full" size="lg">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    إعادة المحاولة
                  </Button>
                  
                  <Button variant="outline" onClick={this.handleGoHome} className="w-full" size="lg">
                    <Home className="w-4 h-4 ml-2" />
                    العودة للرئيسية
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-400">
                    إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
