/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

/**
 * @typedef Result
 * @property {boolean} success Indicates the success or failure of the operation
 * @property {String} [message] Provides additional information on the outcome of the operation; such as the cause of failure
 * @property {Object} [domainObject] The domain object returned by the operation
 * @property {String} [eTag] The ETag returned
 */