package com.sentinel.grpc;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.grpc.CallOptions;
import io.grpc.Channel;
import io.grpc.MethodDescriptor;
import io.grpc.stub.AbstractBlockingStub;
import io.grpc.stub.ClientCalls;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

public final class FireRiskInferenceServiceGrpc {

    public static final String SERVICE_NAME = "sentinel.ml.FireRiskInferenceService";
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private static volatile MethodDescriptor<BatchRiskRequest, BatchRiskResponse> getBatchPredictIgnitionRiskMethod;
    private static volatile MethodDescriptor<SarAnomalyRequest, SarAnomalyResponse> getAnalyzeSarClearingAnomalyMethod;

    private FireRiskInferenceServiceGrpc() {}

    public static MethodDescriptor<BatchRiskRequest, BatchRiskResponse> getBatchPredictIgnitionRiskMethod() {
        MethodDescriptor<BatchRiskRequest, BatchRiskResponse> method = getBatchPredictIgnitionRiskMethod;
        if (method == null) {
            synchronized (FireRiskInferenceServiceGrpc.class) {
                if ((method = getBatchPredictIgnitionRiskMethod) == null) {
                    getBatchPredictIgnitionRiskMethod = method = MethodDescriptor.<BatchRiskRequest, BatchRiskResponse>newBuilder()
                            .setType(MethodDescriptor.MethodType.UNARY)
                            .setFullMethodName(MethodDescriptor.generateFullMethodName(SERVICE_NAME, "BatchPredictIgnitionRisk"))
                            .setSampledToLocalTracing(true)
                            .setRequestMarshaller(createMarshaller(BatchRiskRequest.class))
                            .setResponseMarshaller(createMarshaller(BatchRiskResponse.class))
                            .build();
                }
            }
        }
        return method;
    }

    public static MethodDescriptor<SarAnomalyRequest, SarAnomalyResponse> getAnalyzeSarClearingAnomalyMethod() {
        MethodDescriptor<SarAnomalyRequest, SarAnomalyResponse> method = getAnalyzeSarClearingAnomalyMethod;
        if (method == null) {
            synchronized (FireRiskInferenceServiceGrpc.class) {
                if ((method = getAnalyzeSarClearingAnomalyMethod) == null) {
                    getAnalyzeSarClearingAnomalyMethod = method = MethodDescriptor.<SarAnomalyRequest, SarAnomalyResponse>newBuilder()
                            .setType(MethodDescriptor.MethodType.UNARY)
                            .setFullMethodName(MethodDescriptor.generateFullMethodName(SERVICE_NAME, "AnalyzeSarClearingAnomaly"))
                            .setSampledToLocalTracing(true)
                            .setRequestMarshaller(createMarshaller(SarAnomalyRequest.class))
                            .setResponseMarshaller(createMarshaller(SarAnomalyResponse.class))
                            .build();
                }
            }
        }
        return method;
    }

    private static <T> MethodDescriptor.Marshaller<T> createMarshaller(Class<T> clazz) {
        return new MethodDescriptor.Marshaller<>() {
            @Override
            public InputStream stream(T value) {
                try {
                    return new ByteArrayInputStream(MAPPER.writeValueAsBytes(value));
                } catch (Exception e) {
                    throw new RuntimeException("Error serializing gRPC payload: " + e.getMessage(), e);
                }
            }

            @Override
            public T parse(InputStream stream) {
                try {
                    return MAPPER.readValue(stream, clazz);
                } catch (Exception e) {
                    throw new RuntimeException("Error parsing gRPC response: " + e.getMessage(), e);
                }
            }
        };
    }

    public static FireRiskInferenceServiceBlockingStub newBlockingStub(Channel channel) {
        return FireRiskInferenceServiceBlockingStub.newStub(Factory.INSTANCE, channel);
    }

    private static final class Factory implements io.grpc.stub.AbstractStub.StubFactory<FireRiskInferenceServiceBlockingStub> {
        static final Factory INSTANCE = new Factory();

        @Override
        public FireRiskInferenceServiceBlockingStub newStub(Channel channel, CallOptions callOptions) {
            return new FireRiskInferenceServiceBlockingStub(channel, callOptions);
        }
    }

    public static final class FireRiskInferenceServiceBlockingStub extends AbstractBlockingStub<FireRiskInferenceServiceBlockingStub> {

        private FireRiskInferenceServiceBlockingStub(Channel channel, CallOptions callOptions) {
            super(channel, callOptions);
        }

        @Override
        protected FireRiskInferenceServiceBlockingStub build(Channel channel, CallOptions callOptions) {
            return new FireRiskInferenceServiceBlockingStub(channel, callOptions);
        }

        public BatchRiskResponse batchPredictIgnitionRisk(BatchRiskRequest request) {
            return ClientCalls.blockingUnaryCall(
                    getChannel(),
                    getBatchPredictIgnitionRiskMethod(),
                    getCallOptions(),
                    request
            );
        }

        public SarAnomalyResponse analyzeSarClearingAnomaly(SarAnomalyRequest request) {
            return ClientCalls.blockingUnaryCall(
                    getChannel(),
                    getAnalyzeSarClearingAnomalyMethod(),
                    getCallOptions(),
                    request
            );
        }
    }
}
